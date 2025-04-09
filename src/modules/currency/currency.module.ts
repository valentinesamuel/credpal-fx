import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Currency } from "@modules/core/entities/currency.entity";
import { CurrencyRepository } from "@adapters/repositories/currency.repository";
import { CurrencyService } from "@modules/core/services/currency.service";

@Module({
  imports: [TypeOrmModule.forFeature([Currency])],
  providers: [CurrencyRepository, CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
