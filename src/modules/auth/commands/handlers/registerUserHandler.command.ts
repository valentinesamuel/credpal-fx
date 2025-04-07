import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import * as bcrypt from "bcrypt";
import { AppLogger } from "@shared/observability/logger";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { UserService } from "@modules/core/services/user.service";
import { Injectable } from "@nestjs/common";
import { RegisterUserCommand } from "../commandHandlers";
import { ConfigService } from "@nestjs/config";
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
      await this.otpService.createOtp(
        {
          email: payload.email,
          otpCode: otp.otpCode,
        },
        user.id,
      );
      await this.otpService.sendOtpEmail(otp.otpCode, payload.email);

      this.logger.log("User registered successfully");
      return {
        message: "User registered successfully",
        userId: user.id,
      };
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const rounds = Number(
      this.configService.get<string>("common.auth.saltRounds"),
    );
    const salt = await bcrypt.genSalt(rounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
}
