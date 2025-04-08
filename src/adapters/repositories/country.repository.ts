import { Country } from "@modules/core/entities/country.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, EntityManager, Repository } from "typeorm";

export type PickCountryData = Partial<
  Pick<Country, "id" | "name" | "phoneCode" | "isoAlphaTwoCode">
>;

@Injectable()
export class CountryRepository extends Repository<Country> {
  private readonly logger = new Logger(CountryRepository.name);

  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly entityManager: EntityManager,
  ) {
    super(
      countryRepository.target,
      countryRepository.manager,
      countryRepository.queryRunner,
    );
  }

  async createCountry(
    countryData: Partial<Country>,
    transactionEntityManager?: EntityManager,
  ): Promise<Country> {
    const manager = transactionEntityManager || this.entityManager;
    const country = this.create(countryData);
    return manager.save(country);
  }

  async findCountry(
    id: string,
    transactionEntityManager?: EntityManager,
  ): Promise<Country> {
    const manager = transactionEntityManager || this.entityManager;
    return manager.findOne(Country, {
      where: {
        id,
      },
    });
  }

  async updateCountry(
    id: string,
    updateData: Partial<Country>,
    transactionEntityManager?: EntityManager,
  ): Promise<Country | undefined> {
    const manager = transactionEntityManager || this.entityManager;
    await manager.update(Country, { id }, updateData);
    return this.findCountry(id, transactionEntityManager);
  }

  async findOneAndDeleteById(
    id: string,
    transactionEntityManager?: EntityManager,
  ): Promise<DeleteResult> {
    const manager = transactionEntityManager || this.entityManager;
    return manager.softDelete(Country, { id });
  }

  async getCountryByData(
    countryData: PickCountryData,
    transactionEntityManager?: EntityManager,
  ): Promise<Country> {
    const manager = transactionEntityManager || this.entityManager;
    return manager.findOne(Country, {
      where: [
        { id: countryData?.id },
        { name: countryData?.name },
        { isoAlphaTwoCode: countryData?.isoAlphaTwoCode },
        { phoneCode: countryData?.phoneCode },
      ],
    });
  }
}
