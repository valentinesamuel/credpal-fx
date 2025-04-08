import { FXRateRepository } from "@adapters/repositories/fx.repositories";
import { FXRate } from "@modules/core/entities/fxRate.entity";
import { FXRateService } from "@modules/core/services/fxRates.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FxRateController } from "./fx/fx.controller";
import { CoreModule } from "@modules/core/core.module";
import { CacheModule } from "@adapters/cache/cache.module";
import { AuthModule } from "@modules/auth/auth.module";
import { CqrsModule } from "@nestjs/cqrs";
import { FXRateAdapter } from "@adapters/fxRates/fxRate.adapter";
import { ExchangeRateApiProviderAPI } from "@adapters/fxRates/providers/exchageRateApi.provider";
import { HttpModule } from "@nestjs/axios";
import { CurrencyModule } from "@modules/currency/currency.module";
import { AlphaAdvantageExchangeRateProviderAPI } from "@adapters/fxRates/providers/alphaAdvantage.provider";

@Module({
  imports: [
    HttpModule,
    CoreModule,
    CurrencyModule,
    CqrsModule,
    CacheModule,
    AuthModule,
    TypeOrmModule.forFeature([FXRate]),
  ],
  providers: [
    FXRateService,
    FXRateRepository,
    FXRateAdapter,
    ExchangeRateApiProviderAPI,
    AlphaAdvantageExchangeRateProviderAPI,
  ],
  exports: [FXRateService, FXRateAdapter],
  controllers: [FxRateController],
})
export class FXRateModule {}
