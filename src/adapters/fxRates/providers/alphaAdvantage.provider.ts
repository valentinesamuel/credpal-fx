import { Injectable, Logger } from "@nestjs/common";
import {
  AlphaAdvantageExchangeRateCurrencyPairApiResponse,
  FXRateCurrencyPair,
  FXRateInterface,
  FXRateProviderEnum,
  mapAlphaAdvantageAPIResponseToFXCurrencyPair,
} from "../fxRate.interface";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { CacheAdapter } from "@adapters/cache/cache.adapter";
import { FXRateService } from "@modules/core/services/fxRates.service";
import { isBefore, secondsToMilliseconds } from "date-fns";
import { CurrencyService } from "@modules/core/services/currency.service";
import { FXRate } from "@modules/core/entities/fxRate.entity";

export type ExchangeRateApiResponse = {
  result: string;
  provider: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  time_eol_unix: number;
  base_code: string;
  rates: Record<string, number>;
};

@Injectable()
export class AlphaAdvantageExchangeRateProviderAPI implements FXRateInterface {
  private readonly logger = new Logger(
    AlphaAdvantageExchangeRateProviderAPI.name,
  );
  private readonly API_KEY: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly cacheAdapter: CacheAdapter,
    private readonly fxRateService: FXRateService,
    private readonly currencyService: CurrencyService,
  ) {
    this.API_KEY = this.configService.get<string>(
      "fxRateAPI.alphaAdvantage.apiKey",
    );
  }

  async getFXRateForCurrencyPair(
    baseCurrencyCode: string,
    targetCurrencyCode: string,
  ) {
    try {
      // Cache key for the currency pair
      const cacheKey = `fxRate:${baseCurrencyCode}:${targetCurrencyCode}`;

      // Check cache for existing value
      const cachedValue = await this.cacheAdapter.get(cacheKey);
      if (cachedValue && cachedValue.value) {
        const { nextUpdated } = cachedValue.value as FXRate;
        const now = new Date();
        if (isBefore(now, nextUpdated)) {
          return {
            status: true,
            message: "FX rate retrieved from cache",
            result: cachedValue.value as FXRate,
          };
        }
      }

      // call the API
      const response =
        await this.httpService.axiosRef.get<AlphaAdvantageExchangeRateCurrencyPairApiResponse>(
          `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${baseCurrencyCode}&to_currency=${targetCurrencyCode}&apikey=${this.API_KEY}`,
        );

      const serializedResponse = mapAlphaAdvantageAPIResponseToFXCurrencyPair(
        response.data,
      );

      const { rate, lastUpdated, nextUpdated } = serializedResponse;

      // Get currencies
      const [sourceCurrency, destinationCurrency] = await Promise.all([
        this.currencyService.getCurrencyByDataAndFailIfNotExists({
          code: baseCurrencyCode,
        }),
        this.currencyService.getCurrencyByDataAndFailIfNotExists({
          code: targetCurrencyCode,
        }),
      ]);

      // Create FX rate
      const fxRate = await this.fxRateService.createFXRate({
        baseCurrencyId: sourceCurrency.id,
        targetCurrencyId: destinationCurrency.id,
        rate,
        provider: FXRateProviderEnum.ALPHAVANTAGE,
        lastUpdated,
        nextUpdated,
        metadata: {
          apiResponse: response.data,
        },
      });

      // Store the FX rate in cache
      await this.cacheAdapter.set(
        cacheKey,
        fxRate,
        nextUpdated.getMilliseconds(),
      );

      return {
        status: true,
        message: "FX rate retrieved successfully",
        result: fxRate,
      };
    } catch (error) {
      this.logger.error("❌ Failed to get FX rate:", error.message);
      return {
        status: false,
        result: null,
        message: `Failed to get FX rate: ${error.message}`,
      };
    }
  }
}
