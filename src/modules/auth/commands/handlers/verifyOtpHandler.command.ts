import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { BadRequestException, Injectable } from "@nestjs/common";
import { VerifyOtpCommand } from "../commandHandlers";
import { AppLogger } from "@shared/observability/logger";
import { UserService } from "@modules/core/services/user.service";
import { ConfigService } from "@nestjs/config";
import { OtpService } from "@modules/core/services/otp.service";
import { JwtService } from "@nestjs/jwt";
import { CacheAdapter } from "@adapters/cache/cache.adapter";
import { User } from "@modules/core/entities/user.entity";
import { UnitOfWork } from "@adapters/repositories/transactions/unitOfWork.trx";
import { RoleRepository } from "@adapters/repositories/role.repository";

@Injectable()
@CommandHandler(VerifyOtpCommand)
export class VerifyOtpHandler implements ICommandHandler<VerifyOtpCommand> {
  private readonly logger = new AppLogger(VerifyOtpHandler.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly cacheAdapter: CacheAdapter,
    private readonly otpService: OtpService,
    private readonly unitOfWork: UnitOfWork,
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(command: VerifyOtpCommand) {
    const { payload } = command;

    return this.unitOfWork.executeInTransaction(async () => {
      this.logger.log("Verifying OTP in transaction");

      const isOtpValid = await this.otpService.validateOtp(payload);
      if (!isOtpValid) {
        throw new BadRequestException("Invalid OTP");
      }

      await this.otpService.markOtpAsUsed(payload);

      const role = await this.roleRepository.findRole({
        where: { name: "user" },
      });

      const user = await this.userService.updateUserByData(
        { phoneNumber: payload.phoneNumber },
        { isVerified: true, roleId: role.id },
      );

      // generate jwt token and store in cache
      const token = await this.generateJwtToken(user);

      // send verification email
      await this.sendWelcomeSMS(user.phoneNumber);

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
      `token<rn>${user.id}`,
      token,
      Number(this.configService.get<number>("cache.ttl")),
    );

    return token;
  }

  async sendWelcomeSMS(phoneNumber: string) {
    // await this.smsAdapter.sendSMS({
    //   to: phoneNumber,
    //   message: `Welcome to CredpalFX`,
    // });
  }
}
