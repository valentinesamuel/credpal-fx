import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppLogger } from "@shared/observability/logger";
import { GetFXRatesQuery } from "../queryHandlers";
import { Injectable } from "@nestjs/common";
import { FXRateService } from "@modules/core/services/fxRates.service";

@Injectable()
@QueryHandler(GetFXRatesQuery)
export class GetFXRatesHandler implements IQueryHandler<GetFXRatesQuery> {
  private readonly logger = new AppLogger(GetFXRatesHandler.name);

  constructor(private readonly fxRateService: FXRateService) {}

  async execute(query: GetFXRatesQuery) {
    return this.fxRateService.getFXRates();
  }
}
