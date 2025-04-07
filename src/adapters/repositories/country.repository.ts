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

  async createCountry(countryData: Partial<Country>): Promise<Country> {
    const country = this.create(countryData);
    return this.save(country);
  }

  async findCountry(id: string): Promise<Country> {
    return this.findOne({
      where: {
        id,
      },
    });
  }

  async updateCountry(
    id: string,
    updateData: Partial<Country>,
  ): Promise<Country | undefined> {
    await this.update(id, updateData);
    return this.findCountry(id);
  }

  async findOneAndDeleteById(id: string): Promise<DeleteResult> {
    return this.softDelete({ id });
  }

  async getCountryByData(countryData: PickCountryData): Promise<Country> {
    return this.findOne({
      where: [
        { id: countryData?.id },
        { name: countryData?.name },
        { isoAlphaTwoCode: countryData?.isoAlphaTwoCode },
        { phoneCode: countryData?.phoneCode },
      ],
    });
  }
}
