import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@modules/core/entities/user.entity";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { CacheModule } from "@adapters/cache.module";
import { Broker } from "@broker/broker";

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>("common.jwt.authSecret"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
    CacheModule,
  ],
  providers: [],
  exports: [],
})
export class CoreModule {}
