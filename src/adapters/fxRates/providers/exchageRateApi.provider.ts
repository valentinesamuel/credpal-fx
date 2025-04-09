import { Injectable, Logger } from "@nestjs/common";
import {
  ExchangeRateApiCurencyPairResponse,
  FXRateInterface,
  FXRateProviderEnum,
  mapExchangeRateAPIResponseToFXCurrencyPairs,
  mapExchangeRateAPIResponseToFXCurrencyPair,
  ExchangeRateAPICurrencyPairsApiResponse,
  FXRateCurrencyPairs,
} from "../fxRate.interface";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { CacheAdapter } from "@adapters/cache/cache.adapter";
import { FXRateService } from "@modules/core/services/fxRates.service";
import { isBefore } from "date-fns";
import { CurrencyService } from "@modules/core/services/currency.service";
import { FXRate } from "@modules/core/entities/fxRate.entity";

@Injectable()
export class ExchangeRateApiProviderAPI implements FXRateInterface {
  private readonly logger = new Logger(ExchangeRateApiProviderAPI.name);
  private readonly API_KEY: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly cacheAdapter: CacheAdapter,
    private readonly currencyService: CurrencyService,
    private readonly fxRateService: FXRateService,
  ) {
    this.API_KEY = this.configService.get<string>(
      "fxRateAPI.exchangeRate.apiKey",
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
        await this.httpService.axiosRef.get<ExchangeRateApiCurencyPairResponse>(
          `https://v6.exchangerate-api.com/v6/${this.API_KEY}/pair/${baseCurrencyCode}/${targetCurrencyCode}`,
        );

      const serializedResponse = mapExchangeRateAPIResponseToFXCurrencyPair(
        response.data,
      );

      const { nextUpdated, lastUpdated, rate } = serializedResponse;

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
        response.data,
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

  async getFXRatesForCurrency(baseCurrencyCode: string) {
    try {
      // Cache key for the currency pairs
      const cacheKey = `fxRates:${baseCurrencyCode}`;

      // Check cache for existing value
      const cachedValue = await this.cacheAdapter.get(cacheKey);
      if (cachedValue) {
        const { nextUpdated } = cachedValue.value as FXRateCurrencyPairs;
        const now = new Date();
        if (isBefore(now, nextUpdated)) {
          return {
            status: true,
            message: "FX rates retrieved from cache",
            result: cachedValue.value as FXRateCurrencyPairs,
          };
        }
      }

      const response =
        await this.httpService.axiosRef.get<ExchangeRateAPICurrencyPairsApiResponse>(
          `https://open.er-api.com/v6/latest/${baseCurrencyCode}`,
        );

      const serializedResponse = mapExchangeRateAPIResponseToFXCurrencyPairs(
        response.data,
      );

      const { rates, nextUpdated } = serializedResponse;

      // Get currency
      const currency =
        await this.currencyService.getCurrencyByDataAndFailIfNotExists({
          code: baseCurrencyCode,
        });

      // Store the FX rates in cache
      await this.cacheAdapter.set(
        `fxRates:${currency.code}`,
        rates,
        nextUpdated.getMilliseconds(),
      );

      return {
        status: true,
        message: "FX rates retrieved successfully",
        result: serializedResponse,
      };
    } catch (error) {
      this.logger.error("❌ Failed to get FX rates:", error.message);
      return {
        status: false,
        result: null,
        message: `Failed to get FX rates: ${error.message}`,
      };
    }
  }
}
