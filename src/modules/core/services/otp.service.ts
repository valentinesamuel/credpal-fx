import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { addMinutes } from "date-fns";
import { AppLogger } from "@shared/observability/logger";
import { OtpRepository } from "@adapters/repositories/otp.repository";
import { UserService } from "./user.service";
import { SMSAdapter } from "@adapters/sms/sms.adapter";
import { VerifyOtpDto } from "@modules/auth/dto/verifyOtp.dto";
import { EmailAdapter } from "@adapters/email/email.adapter";

@Injectable()
export class OtpService {
  private readonly logger = new AppLogger(OtpService.name);
  private readonly otpSaltRounds: number;
  private readonly expiryMinutes: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly otpRepository: OtpRepository,
    private readonly emailAdapter: EmailAdapter,
  ) {
    this.otpSaltRounds = this.configService.get<number>(
      "common.otp.otpSaltRounds",
    );
    this.expiryMinutes = this.configService.get<number>(
      "common.otp.expiryMinutes",
    );
  }

  async generateOtp(email: string) {
    if (!email) {
      throw new Error("Email is required to generate an OTP");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const pinId = await bcrypt.hash(otpCode, this.otpSaltRounds);
    const expiresAt = addMinutes(new Date(), this.expiryMinutes);
    this.logger.log(`Generated OTP for ${email}`);

    return { otpCode, pinId, expiresAt };
  }

  async createOtp(otpCode: string, email: string) {
    const pinId = await bcrypt.hash(otpCode, this.otpSaltRounds);
    const expiresAt = addMinutes(new Date(), this.expiryMinutes);

    return this.otpRepository.createOtp({
      email,
      pinId,
      expiresAt,
      isActive: true,
    });
  }

  async sendOtpToPhoneNumber(otpCode: string, email: string) {
    this.emailAdapter.sendOtpEmail(email, otpCode);
  }

  async validateOtp(otp: VerifyOtpDto): Promise<boolean> {
    const otpRecord = await this.otpRepository.findOne({
      where: { email: otp.email, isActive: true },
    });
    this.logger.log("OTP Record...", otpRecord);

    if (!otpRecord) {
      return false;
    }
    const isOtpValid = await bcrypt.compare(otp.otpCode, otpRecord.pinId);

    if (!isOtpValid) {
      throw new BadRequestException("Invalid OTP");
    }

    if (otpRecord.expiresAt < new Date()) {
      this.otpRepository.update(otpRecord.id, { isActive: false });
      throw new BadRequestException("OTP Expired");
    }

    this.otpRepository.update(otpRecord.id, { isActive: false });
    return true;
  }

  async markOtpAsUsed(otpCode: string) {
    const otpRecord = await this.otpRepository.findOne({
      where: { pinId: otpCode },
    });
    if (!otpRecord) {
      throw new BadRequestException("Invalid OTP");
    }
    await this.otpRepository.update(otpRecord.id, { isActive: false });
  }
}
