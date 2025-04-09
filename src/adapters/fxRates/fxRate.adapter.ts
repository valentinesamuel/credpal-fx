import { Injectable } from "@nestjs/common";
import {
  FXRateCurrencyPairs,
  FXRateInterface,
  FXRateProviderEnum,
} from "./fxRate.interface";
import { ExchangeRateApiProviderAPI } from "./providers/exchageRateApi.provider";
import { AppLogger } from "@shared/observability/logger";
import { FXRate } from "@modules/core/entities/fxRate.entity";
import { AlphaAdvantageExchangeRateProviderAPI } from "./providers/alphaAdvantage.provider";

@Injectable()
export class FXRateAdapter implements FXRateInterface {
  private readonly logger = new AppLogger(FXRateAdapter.name);

  private provider: FXRateInterface;

  constructor(
    private readonly exchangeRateProvider: ExchangeRateApiProviderAPI,
    private readonly alphaAdvantage: AlphaAdvantageExchangeRateProviderAPI,
  ) {}
  async getFXRateForCurrencyPair(
    baseCurrencyCode: string,
    targetCurrencyCode: string,
    provider?: FXRateProviderEnum,
  ) {
    this.initializeProvider(provider ?? FXRateProviderEnum.EXCHANGE_RATE_API);
    return this.provider.getFXRateForCurrencyPair(
      baseCurrencyCode,
      targetCurrencyCode,
    );
  }

  async getFXRatesForCurrency(
    baseCurrencyCode: string,
    provider?: FXRateProviderEnum,
  ) {
    this.initializeProvider(provider ?? FXRateProviderEnum.EXCHANGE_RATE_API);
    return this.provider.getFXRatesForCurrency(baseCurrencyCode);
  }

  private initializeProvider(provider: FXRateProviderEnum) {
    switch (provider) {
      case FXRateProviderEnum.EXCHANGE_RATE_API:
        this.provider = this.exchangeRateProvider;
        break;
      case FXRateProviderEnum.ALPHAVANTAGE:
        this.provider = this.alphaAdvantage;
        break;
      default:
        this.logger.error("❌ Invalid FX rate provider.");
        throw new Error("Invalid FX rate provider.");
    }
  }
}
