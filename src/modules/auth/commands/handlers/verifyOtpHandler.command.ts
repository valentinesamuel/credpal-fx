import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, Injectable } from "@nestjs/common";
import { VerifyOtpCommand } from "../commandHandlers";
import { AppLogger } from "@shared/observability/logger";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { UserService } from "@modules/core/services/user.service";
import { ConfigService } from "@nestjs/config";
import { OtpService } from "@modules/core/services/otp.service";
import { JwtService } from "@nestjs/jwt";
import { CacheAdapter } from "@adapters/cache/cache.adapter";
import { User } from "@modules/core/entities/user.entity";
import { EmailAdapter } from "@adapters/email/email.adapter";

@CommandHandler(VerifyOtpCommand)
@Injectable()
export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand> {
  private readonly logger = new AppLogger(VerifyOtpHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly userService: UserService,
    private configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly cacheAdapter: CacheAdapter,
    private readonly emailAdapter: EmailAdapter,
    private readonly otpService: OtpService,
  ) {}

  async execute(command: VerifyOtpCommand) {
    const { payload } = command;

    return this.entityManager.transaction(async () => {
      this.logger.log("Verifying OTP in transaction");

      const isOtpValid = await this.otpService.validateOtp(payload);
      if (!isOtpValid) {
        throw new BadRequestException("Invalid OTP");
      }

      await this.otpService.markOtpAsUsed(payload.otpCode);

      const user = await this.userService.updateUserByData(
        { email: payload.email },
        { isVerified: true },
      );

      // create wallet for user
      await this.createWallet(user.id);

      // generate jwt token and store in cache
      const token = await this.generateJwtToken(user);

      // send verification email
      await this.emailAdapter.sendWelcomeEmail(user.email, user.firstName);

      delete user.password;

      return {
        message: "User verified successfully",
        token,
        user,
      };
    });
  }

  async generateJwtToken(user: User) {
    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
    });
    await this.cacheAdapter.set(
      `auth:${user.id}`,
      token,
      Number(this.configService.get<number>("common.jwt.expiryMinutes")),
    );
    return token;
  }

  async createWallet(userId: string) {}
}
