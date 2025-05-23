import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import commonConfig from "@config/common.config";
import typeormConfig from "@config/typeorm.config";
import cacheConfig from "@config/cache.config";
import notificationConfig from "@config/notification.config";
import schemaConfig from "@config/schema.config";
import fxRateAPIConfig from "@config/fxRateAPI.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { CoreModule } from "@modules/core/core.module";
import { AuthModule } from "@modules/auth/auth.module";
import { OtpModule } from "@modules/otp/otp.module";
import { WalletModule } from "@modules/wallet/wallet.module";
import { SeederService } from "@modules/core/services/seeder.service";
import { Permission } from "@modules/core/entities/permission.entity";
import { Role } from "@modules/core/entities/role.entity";
import { RolePermission } from "@modules/core/entities/rolePermission.entity";
import { CountryModule } from "@modules/country/country.module";
import { CurrencyModule } from "@modules/currency/currency.module";
import { TransactionModule } from "@modules/transaction/transaction.module";
import { FXRateModule } from "@modules/trade/fxRate.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        commonConfig,
        typeormConfig,
        cacheConfig,
        notificationConfig,
        fxRateAPIConfig,
      ],
      ...schemaConfig,
    }),
    CoreModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get("typeorm"),
    }),
    TypeOrmModule.forFeature([Permission, Role, RolePermission]),
    PrometheusModule.register({
      path: "/metrics",
    }),
    AuthModule,
    CurrencyModule,
    CountryModule,
    OtpModule,
    WalletModule,
    TransactionModule,
    FXRateModule,
  ],
  controllers: [AppController],
  providers: [SeederService],
  exports: [],
})
export class AppModule {}
