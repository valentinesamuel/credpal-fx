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
import { CacheModule } from "@adapters/cache/cache.module";
import { WalletModule } from "@modules/wallet/wallet.module";
import { JwtModule } from "@nestjs/jwt";

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
    OtpModule,
    WalletModule,
  ],
  controllers: [AppController],
  providers: [],
  exports: [],
})
export class AppModule {}
