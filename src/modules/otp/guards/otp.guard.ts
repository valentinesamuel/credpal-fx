import { VerifyOtpDto } from "@modules/auth/dto/verifyOtp.dto";
import { OtpService } from "@modules/core/services/otp.service";
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from "@nestjs/common";
import { AppLogger } from "@shared/observability/logger";

export type UserOtpRequest = {
  code: string;
  phoneNumber: string;
};

@Injectable()
export class OtpGuard implements CanActivate {
  private readonly logger = new AppLogger(OtpGuard.name);

  constructor(private readonly otpService: OtpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const otp: VerifyOtpDto = req?.body;

    this.logger.log("Checking OTP...", otp);

    const isOtpValid = await this.otpService.validateOtp(otp);

    if (!isOtpValid) {
      this.logger.log("❌ ERR_CREDPAL_3: Invalid OTP");
      throw new BadRequestException("ERR_CREDPAL_3: Invalid OTP");
    }

    return true;
  }
}
