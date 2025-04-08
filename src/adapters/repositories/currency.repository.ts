import { Injectable, Logger } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Currency } from "@modules/core/entities/currency.entity";

export type PickCurrencyData = Partial<
  Pick<Currency, "id" | "name" | "code" | "countryId">
>;

@Injectable()
export class CurrencyRepository extends Repository<Currency> {
  private readonly logger = new Logger(CurrencyRepository.name);

  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    private readonly entityManager: EntityManager,
  ) {
    super(
      currencyRepository.target,
      currencyRepository.manager,
      currencyRepository.queryRunner,
    );
  }

  async createCurrency(
    currencyData: Partial<Currency>,
    transactionEntityManager?: EntityManager,
  ): Promise<Currency> {
    const manager = transactionEntityManager || this.entityManager;
    const currency = this.create(currencyData);
    return manager.save(currency);
  }

  async findCurrency(
    filter: PickCurrencyData,
    transactionEntityManager?: EntityManager,
  ): Promise<Currency> {
    const manager = transactionEntityManager || this.entityManager;
    return manager.findOne(Currency, {
      where: [
        { id: filter.id },
        { name: filter.name },
        { code: filter.code },
        { countryId: filter.countryId },
      ],
    });
  }

  async updateCurrency(
    id: string,
    currencyData: Partial<Currency>,
    transactionEntityManager?: EntityManager,
  ): Promise<Currency> {
    const manager = transactionEntityManager || this.entityManager;
    await manager.update(Currency, { id }, currencyData);
    return this.findCurrency(
      {
        id,
      },
      transactionEntityManager,
    );
  }

  async getCurrencyByData(
    currencyData: PickCurrencyData,
    transactionEntityManager?: EntityManager,
  ): Promise<Currency> {
    const manager = transactionEntityManager || this.entityManager;
    return manager.findOne(Currency, {
      where: [
        { id: currencyData?.id },
        { name: currencyData?.name },
        { code: currencyData?.code },
        { countryId: currencyData?.countryId },
      ],
    });
  }
}
