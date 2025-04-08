import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import commonConfig from "@config/common.config";
import typeormConfig from "@config/typeorm.config";
import cacheConfig from "@config/cache.config";
import notificationConfig from "@config/notification.config";
import schemaConfig from "@config/schema.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PrometheusModule } from "@willsoto/nestjs-prometheus";
import { CoreModule } from "@modules/core/core.module";
import { AuthModule } from "@modules/auth/auth.module";
import { OtpModule } from "@modules/otp/otp.module";
import { WalletModule } from "@modules/wallet/wallet.module";
import { JwtModule } from "@nestjs/jwt";
import { SeederService } from "@modules/core/services/seeder.service";
import { Permission } from "@modules/core/entities/permission.entity";
import { Role } from "@modules/core/entities/role.entity";
import { RolePermission } from "@modules/core/entities/rolePermission.entity";
import { CountryModule } from "@modules/country/country.module";
import { CurrencyModule } from "@modules/currency/currency.module";
import { TransactionModule } from "@modules/transaction/transaction.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [commonConfig, typeormConfig, cacheConfig, notificationConfig],
      ...schemaConfig,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get("typeorm"),
    }),
    TypeOrmModule.forFeature([Permission, Role, RolePermission]),
    PrometheusModule.register({
      path: "/metrics",
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("common.auth.authSecret"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
    CoreModule,
    AuthModule,
    CurrencyModule,
    CountryModule,
    OtpModule,
    WalletModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [SeederService],
  exports: [],
})
export class AppModule {}
