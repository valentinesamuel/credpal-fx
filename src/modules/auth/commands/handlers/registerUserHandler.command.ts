import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AppLogger } from "@shared/observability/logger";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { UserService } from "@modules/core/services/user.service";
import { Injectable } from "@nestjs/common";
import { RegisterUserCommand } from "../commandHandlers";
import * as bcrypt from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CacheAdapter } from "@adapters/cache/cache.adapter";

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  private readonly logger = new AppLogger(RegisterUserHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly userService: UserService,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly cacheAdapter: CacheAdapter,
  ) {}

  async execute(command: RegisterUserCommand) {
    const { payload } = command;

    return this.entityManager.transaction(async () => {
      this.logger.log("Registering user in transaction");

      // Use the transactional service
      await this.userService.findUserAndFailIfExist({
        email: payload.email,
      });
      const user = await this.userService.addUser(payload);

      this.logger.log("User registered successfully");
      return {
        message: "User registered successfully",
        userId: user.id,
      };
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = this.configService.get<string>("common.saltRounds");
    return bcrypt.hash(password, Number(salt));
  }
}
