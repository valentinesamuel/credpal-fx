import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import commonConfig from "@config/common.config";
import typeormConfig from "@config/typeorm.config";
import cacheConfig from "@config/cache.config";
import schemaConfig from "@config/schema.config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Broker } from "@broker/broker";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [commonConfig, typeormConfig, cacheConfig],
      ...schemaConfig,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get("typeorm"),
    }),
  ],
  controllers: [AppController],
  providers: [Broker],
  exports: [Broker],
})
export class AppModule {}
