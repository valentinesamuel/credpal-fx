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

  async createCurrency(currencyData: Partial<Currency>): Promise<Currency> {
    const currency = this.create(currencyData);
    return this.save(currency);
  }

  async findCurrency(filter: PickCurrencyData): Promise<Currency> {
    return this.findOne({
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
  ): Promise<Currency> {
    await this.update({ id }, currencyData);
    return this.findCurrency({ id });
  }

  async getCurrencyByData(currencyData: PickCurrencyData): Promise<Currency> {
    return this.findOne({
      where: [
        { id: currencyData?.id },
        { name: currencyData?.name },
        { code: currencyData?.code },
        { countryId: currencyData?.countryId },
      ],
    });
  }
}
