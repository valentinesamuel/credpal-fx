import { FXRateRepository } from "@adapters/repositories/fx.repositories";
import { Injectable } from "@nestjs/common";

@Injectable()
export class FXRateService {
  constructor(private readonly fxRatesRepository: FXRateRepository) {}

  async getFXRates() {
    return this.fxRatesRepository.find();
  }
}
