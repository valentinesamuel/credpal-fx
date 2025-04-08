import { FXRateRepository } from "@adapters/repositories/fx.repositories";
import { Injectable } from "@nestjs/common";
import { FXRate } from "../entities/fxRate.entity";

export type PartialPickFXRate = Partial<
  Pick<FXRate, "baseCurrencyId" | "targetCurrencyId">
>;

@Injectable()
export class FXRateService {
  constructor(private readonly fxRatesRepository: FXRateRepository) {}

  async getFXRates() {
    return this.fxRatesRepository.find();
  }

  async createFXRate(fxRate: Partial<FXRate>) {
    return this.fxRatesRepository.create(fxRate);
  }

  async updateFXRate(id: string, fxRate: Partial<FXRate>) {
    return this.fxRatesRepository.update(id, fxRate);
  }

  async deleteFXRate(id: string) {
    return this.fxRatesRepository.delete(id);
  }

  async getFXRateByCurrencyData(currencyData: PartialPickFXRate) {
    return this.fxRatesRepository.findOne({ where: currencyData });
  }

  async getFXRateByCurrencyPair(
    baseCurrencyId: string,
    targetCurrencyId: string,
  ) {
    return this.fxRatesRepository.findOne({
      where: { baseCurrencyId, targetCurrencyId },
    });
  }
}
