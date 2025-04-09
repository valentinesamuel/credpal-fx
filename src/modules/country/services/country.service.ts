import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Country } from "../../core/entities/country.entity";
import {
  CountryRepository,
  PickCountryData,
} from "@adapters/repositories/country.repository";

@Injectable()
export class CountryService {
  private readonly logger = new Logger(CountryService.name);

  constructor(private readonly countryRepository: CountryRepository) {}

  async addCountry(countryData: Partial<Country>) {
    return this.countryRepository.createCountry(countryData);
  }

  async getCountryById(id: string) {
    return this.countryRepository.findCountry(id);
  }

  async deleteCountryById(id: string) {
    return this.countryRepository.findOneAndDeleteById(id);
  }

  async updateCountryById(id: string, country: Partial<Country>) {
    return this.countryRepository.updateCountry(id, country);
  }

  async getCountryByIdOrFail(id: string) {
    const country = await this.countryRepository.findCountry(id);
    if (!country) {
      throw new NotFoundException("country not found");
    }
    return country;
  }

  async findCountryByData(countryData: PickCountryData) {
    return this.countryRepository.getCountryByData(countryData);
  }

  async findCountryAndFailIfExist(filter: PickCountryData): Promise<void> {
    const country = await this.countryRepository.getCountryByData(filter);
    if (country) {
      if (country.name === filter.name) {
        throw new ConflictException("This name is already in use");
      } else if (country.phoneCode === filter.phoneCode) {
        throw new ConflictException("This phoneCode is already in use");
      }
      throw new ConflictException("This country already exists");
    }
  }

  async findCountryAndFailIfNotExist(filter: PickCountryData) {
    const country = await this.countryRepository.getCountryByData(filter);
    if (!country) {
      throw new NotFoundException("country not found");
    }
    return country;
  }
}
