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
import { EmailAdapter } from "@adapters/email/email.adapter";
import { OtpService } from "@modules/core/services/otp.service";

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
    // private readonly jwtService: JwtService,
    // private readonly cacheAdapter: CacheAdapter,
    // private readonly emailAdapter: EmailAdapter,
    private readonly otpService: OtpService,
  ) {}

  async execute(command: RegisterUserCommand) {
    const { payload } = command;

    return this.entityManager.transaction(async () => {
      this.logger.log("Registering user in transaction");

      const hashedPassword = await this.hashPassword(payload.password);

      await this.userService.findUserAndFailIfExist({
        email: payload.email,
      });

      const user = await this.userService.addUser({
        ...payload,
        password: hashedPassword,
      });

      const otp = await this.otpService.generateOtp(payload.email);
      await this.otpService.createOtp(otp.otpCode, payload.email);
      await this.otpService.sendOtpToPhoneNumber(otp.otpCode, payload.email);

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
