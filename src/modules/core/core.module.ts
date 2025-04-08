import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@modules/core/entities/user.entity";
import { UtilityService } from "@shared/utils/utility.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UnitOfWork } from "@adapters/repositories/transactions/unitOfWork.trx";

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("common.auth.authSecret"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [UtilityService, UnitOfWork],
  exports: [UtilityService, JwtModule, UnitOfWork],
})
export class CoreModule {}
