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

@Module({
  imports: [
    CoreModule,
    CqrsModule,
    CacheModule,
    AuthModule,
    TypeOrmModule.forFeature([FXRate]),
  ],
  providers: [FXRateService, FXRateRepository],
  exports: [FXRateService],
  controllers: [FxRateController],
})
export class FXRateModule {}
