import { Module } from "@nestjs/common";
import { CoreModule } from "@modules/core/core.module";
import { UserService } from "@modules/core/services/user.service";
import { UserRepository } from "@adapters/repositories/user.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@modules/core/entities/user.entity";
import { AuthController } from "./controller/auth.controller";
import { RegisterUserUsecase } from "./usecases/registerUser.usecase";
import { Broker } from "@broker/broker";

@Module({
  imports: [CoreModule, TypeOrmModule.forFeature([User])],
  providers: [
    // Services
    UserService,

    // Repositories
    UserRepository,

    // UseCases
    RegisterUserUsecase,

    // Broker
    Broker,
  ],
  exports: [],
  controllers: [AuthController],
})
export class AuthModule {}
