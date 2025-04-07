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

// Define all command handlers
const CommandHandlers = [RegisterUserHandler];

// Define all query handlers
const QueryHandlers = [GetUserByIdHandler];

@Module({
  imports: [CqrsModule, CoreModule, TypeOrmModule.forFeature([User])],
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
