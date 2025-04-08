import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@modules/core/entities/user.entity";
import { UtilityService } from "@shared/utils/utility.service";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

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
  providers: [UtilityService],
  exports: [UtilityService, JwtModule],
})
export class CoreModule {}
