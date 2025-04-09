import { FXRate } from "@modules/core/entities/fxRate.entity";
import { addMilliseconds, addMinutes } from "date-fns";

export enum FXRateProviderEnum {
  EXCHANGE_RATE_API = "exchangeRateApi",
  ALPHAVANTAGE = "alphavantage",
}

export type AlphaAdvantageExchangeRateCurrencyPairApiResponse = {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
  conversion_result: number;
};

export type ExchangeRateApiCurencyPairResponse = {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
};

export type ExchangeRateAPICurrencyPairsApiResponse = {
  time_last_updated: number;
  base: string;
  rates: Record<string, number>;
};

export type FXRateCurrencyPair = {
  provider: FXRateProviderEnum;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  lastUpdated: Date;
  nextUpdated: Date;
  metadata: Record<string, any>;
};

export type FXRateCurrencyPairs = {
  provider: FXRateProviderEnum;
  baseCurrency: string;
  rates: Record<string, number>;
  lastUpdated: Date;
  nextUpdated: Date;
  metadata: Record<string, any>;
};

export const mapExchangeRateAPIResponseToFXCurrencyPair = (
  apiAdvantageInput: ExchangeRateApiCurencyPairResponse,
): FXRateCurrencyPair => {
  return {
    baseCurrency: apiAdvantageInput.base_code,
    targetCurrency: apiAdvantageInput.target_code,
    rate: apiAdvantageInput.conversion_rate,
    lastUpdated: new Date(apiAdvantageInput.time_last_update_unix),
    nextUpdated: new Date(apiAdvantageInput.time_next_update_unix),
    provider: FXRateProviderEnum.EXCHANGE_RATE_API,
    metadata: {
      apiResponse: apiAdvantageInput,
    },
  };
};

export const mapExchangeRateAPIResponseToFXCurrencyPairs = (
  apiAdvantageInput: ExchangeRateAPICurrencyPairsApiResponse,
): FXRateCurrencyPairs => {
  return {
    baseCurrency: apiAdvantageInput.base,
    lastUpdated: new Date(apiAdvantageInput.time_last_updated),
    nextUpdated: addMinutes(new Date(apiAdvantageInput.time_last_updated), 5),
    provider: FXRateProviderEnum.EXCHANGE_RATE_API,
    rates: apiAdvantageInput.rates,
    metadata: {
      apiResponse: apiAdvantageInput,
    },
  };
};

export const mapAlphaAdvantageAPIResponseToFXCurrencyPair = (
  apiAdvantageInput: AlphaAdvantageExchangeRateCurrencyPairApiResponse,
): FXRateCurrencyPair => {
  const rateData = apiAdvantageInput["Realtime Currency Exchange Rate"];
  return {
    baseCurrency: rateData["1. From_Currency Code"],
    targetCurrency: rateData["2. To_Currency Code"],
    rate: Number(rateData["5. Exchange Rate"]),
    lastUpdated: new Date(rateData["6. Last Refreshed"]),
    nextUpdated: addMinutes(new Date(rateData["6. Last Refreshed"]), 5),
    provider: FXRateProviderEnum.ALPHAVANTAGE,
    metadata: {
      apiResponse: apiAdvantageInput,
    },
  };
};

export interface FXRateInterface {
  getFXRateForCurrencyPair(
    baseCurrencyCode: string,
    targetCurrencyCode: string,
    provider?: FXRateProviderEnum,
  ): Promise<{
    status: boolean;
    message: string;
    result: FXRate;
  }>;

  getFXRatesForCurrency?(
    baseCurrencyCode: string,
    provider?: FXRateProviderEnum,
  ): Promise<{
    status: boolean;
    message: string;
    result: FXRateCurrencyPairs;
  }>;
}
