import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppLogger } from "@shared/observability/logger";
import { GetFXRatesQuery } from "../queryHandlers";
import { Injectable } from "@nestjs/common";
import { FXRateAdapter } from "@adapters/fxRates/fxRate.adapter";

@Injectable()
@QueryHandler(GetFXRatesQuery)
export class GetFXRatesHandler implements IQueryHandler<GetFXRatesQuery> {
  private readonly logger = new AppLogger(GetFXRatesHandler.name);

  constructor(private readonly fxAdapter: FXRateAdapter) {}

  async execute(query: GetFXRatesQuery) {
    const { currencyCode } = query;
    const fxRates = await this.fxAdapter.getFXRatesForCurrency(currencyCode);
    const formattedFXRates = fxRates.result.rates;

    const currentRates = {
      currencyCode,
      formattedFXRates,
      lastUpdated: fxRates.result.lastUpdated,
      provider: fxRates.result.provider,
    };

    return { currentRates };
  }
}
