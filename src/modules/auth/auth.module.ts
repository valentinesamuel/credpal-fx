import { Module } from "@nestjs/common";
import { CoreModule } from "@modules/core/core.module";
import { UserService } from "@modules/core/services/user.service";
import { UserRepository } from "@adapters/repositories/user.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@modules/core/entities/user.entity";
import { AuthController } from "./controller/auth.controller";

@Module({
  imports: [CoreModule, TypeOrmModule.forFeature([User])],
  providers: [
    // Services
    UserService,

    // Repositories
    UserRepository,
  ],
  exports: [],
  controllers: [AuthController],
})
export class AuthModule {}
