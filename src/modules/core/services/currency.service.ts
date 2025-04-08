import {
  CurrencyRepository,
  PickCurrencyData,
} from "@adapters/repositories/currency.repository";
import { Injectable } from "@nestjs/common";
import { Currency } from "@modules/core/entities/currency.entity";
import { EntityManager } from "typeorm";

@Injectable()
export class CurrencyService {
  constructor(
    private readonly currencyRepository: CurrencyRepository,
    private readonly entityManager: EntityManager,
  ) {}

  async createCurrency(currencyData: Partial<Currency>): Promise<Currency> {
    return this.currencyRepository.createCurrency(currencyData);
  }

  async findCurrency(
    filter: PickCurrencyData,
    transactionEntityManager?: EntityManager,
  ): Promise<Currency> {
    const manager = transactionEntityManager || this.entityManager;
    return this.currencyRepository.findCurrency(filter, manager);
  }

  async updateCurrency(
    id: string,
    currencyData: Partial<Currency>,
    transactionEntityManager?: EntityManager,
  ): Promise<Currency> {
    const manager = transactionEntityManager || this.entityManager;
    return this.currencyRepository.updateCurrency(id, currencyData, manager);
  }

  async getCurrencyByData(
    currencyData: PickCurrencyData,
    transactionEntityManager?: EntityManager,
  ): Promise<Currency> {
    const manager = transactionEntityManager || this.entityManager;
    return this.currencyRepository.getCurrencyByData(currencyData, manager);
  }
}
