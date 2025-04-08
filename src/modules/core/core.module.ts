import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@modules/core/entities/user.entity";
import { UtilityService } from "@shared/utils/utility.service";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UnitOfWork } from "@adapters/repositories/transactions/unitOfWork.trx";
import { CacheModule } from "@adapters/cache/cache.module";
import { UserService } from "./services/user.service";
import { UserRepository } from "@adapters/repositories/user.repository";
import { CqrsModule } from "@nestjs/cqrs";

@Module({
  imports: [
    CacheModule,
    CqrsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>("common.auth.authSecret"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    UtilityService,
    UnitOfWork,
    JwtService,
    UserService,
    UserRepository,
  ],
  exports: [UtilityService, JwtModule, UnitOfWork],
})
export class CoreModule {}
