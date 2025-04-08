import {
  CurrencyRepository,
  PickCurrencyData,
} from "@adapters/repositories/currency.repository";
import { Injectable } from "@nestjs/common";
import { Currency } from "@modules/core/entities/currency.entity";

@Injectable()
export class CurrencyService {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async createCurrency(currencyData: Partial<Currency>): Promise<Currency> {
    return this.currencyRepository.createCurrency(currencyData);
  }

  async findCurrency(filter: PickCurrencyData): Promise<Currency> {
    return this.currencyRepository.findCurrency(filter);
  }

  async updateCurrency(
    id: string,
    currencyData: Partial<Currency>,
  ): Promise<Currency> {
    return this.currencyRepository.updateCurrency(id, currencyData);
  }

  async getCurrencyByData(currencyData: PickCurrencyData): Promise<Currency> {
    return this.currencyRepository.getCurrencyByData(currencyData);
  }
}
