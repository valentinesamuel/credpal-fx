import { Module } from "@nestjs/common";
import { CountryService } from "@modules/country/services/country.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Country } from "@modules/core/entities/country.entity";
import { CountryRepository } from "@adapters/repositories/country.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  providers: [CountryService, CountryRepository],
  controllers: [],
  exports: [CountryService, CountryRepository],
})
export class CountryModule {}
