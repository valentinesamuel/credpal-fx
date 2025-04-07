import { Module } from "@nestjs/common";
import { CoreModule } from "@modules/core/core.module";
import { UserService } from "@modules/core/services/user.service";
import { UserRepository } from "@adapters/repositories/user.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@modules/core/entities/user.entity";
import { AuthController } from "./controller/auth.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { GetUserByIdHandler } from "./queries/handlers/getUserById.handler";
import { RegisterUserHandler } from "./commands/handlers/registerUserHandler.command";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { CacheModule } from "@adapters/cache.module";
import { EmailModule } from "@adapters/email/email.module";
import { OtpModule } from "@modules/otp/otp.module";
import { UtilityService } from "@shared/utils/utility.service";
import { CountryModule } from "@modules/country/country.module";
import { VerifyOtpHandler } from "./commands/handlers/verifyOtpHandler.command";
import { SMSModule } from "@adapters/sms/sms.module";

// Define all command handlers
const CommandHandlers = [RegisterUserHandler, VerifyOtpHandler];

const QueryHandlers = [GetUserByIdHandler];

@Module({
  imports: [
    ConfigModule.forRoot(),
    CqrsModule,
    CoreModule,
    CacheModule,
    SMSModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("common.auth.authSecret"),
        signOptions: { expiresIn: "1d" },
      }),
    }),
    OtpModule,
    CountryModule,
  ],
  providers: [
    // Services
    UserService,

    // Repositories
    UserRepository,

    // Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
