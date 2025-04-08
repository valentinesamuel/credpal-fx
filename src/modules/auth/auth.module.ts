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
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@adapters/cache/cache.module";
import { OtpModule } from "@modules/otp/otp.module";
import { CountryModule } from "@modules/country/country.module";
import { VerifyOtpHandler } from "./commands/handlers/verifyOtpHandler.command";
import { SMSModule } from "@adapters/sms/sms.module";
import { RoleRepository } from "@adapters/repositories/role.repository";
import { Role } from "@modules/core/entities/role.entity";

const CommandHandlers = [RegisterUserHandler, VerifyOtpHandler];

const QueryHandlers = [GetUserByIdHandler];

@Module({
  imports: [
    ConfigModule.forRoot(),
    CqrsModule,
    CoreModule,

    CacheModule,
    SMSModule,
    TypeOrmModule.forFeature([User, Role]),

    OtpModule,
    CountryModule,
  ],
  providers: [
    // Services
    UserService,

    // Repositories
    UserRepository,
    RoleRepository,

    // Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [UserService],
  controllers: [AuthController],
})
export class AuthModule {}
