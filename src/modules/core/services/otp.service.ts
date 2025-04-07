import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { addMinutes } from "date-fns";
import { AppLogger } from "@shared/observability/logger";
import { OtpRepository } from "@adapters/repositories/otp.repository";
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
    private readonly smsAdapter: SMSAdapter,
  ) {
    this.otpSaltRounds = Number(
      this.configService.get<string>("common.otp.otpSaltRounds"),
    );
    this.expiryMinutes = Number(
      this.configService.get<string>("common.otp.expiryMinutes"),
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

  async createOtp(otp: VerifyOtpDto, userId: string) {
    const pinId = await bcrypt.hash(otp.otpCode, this.otpSaltRounds);
    const expiresAt = addMinutes(new Date(), this.expiryMinutes);

    return this.otpRepository.createOtp({
      phoneNumber: otp.phoneNumber,
      pinId,
      expiresAt,
      isActive: true,
      userId,
    });
  }

  async sendOtpEmail(otpCode: string, email: string) {
    const response = await this.emailAdapter.sendMail({
      to: email,
      from: this.configService.get<string>("notification.email.sendgrid.from"),
      subject: "OTP Verification",
      text: `Your OTP is ${otpCode}`,
    });
    return response;
  }

  async sendOtpSms(otpCode: string, phone: string) {
    const response = await this.smsAdapter.sendSMS({
      to: phone,
      from: this.configService.get<string>("notification.sms.twilio.from"),
      message: `Your OTP is ${otpCode} and it will expire in ${this.expiryMinutes} minutes - CredpalFX`,
    });
    return response;
  }

  async validateOtp(otp: VerifyOtpDto): Promise<boolean> {
    const otpRecord = await this.otpRepository.findOne({
      where: { phoneNumber: otp.phoneNumber, isActive: true },
    });

    if (!otpRecord) {
      return false;
    }
    const isOtpValid = await bcrypt.compare(otp.otpCode, otpRecord.pinId);

    if (!isOtpValid) {
      return false;
    }

    if (otpRecord.expiresAt < new Date()) {
      this.otpRepository.update(otpRecord.id, { isActive: false });
      throw new BadRequestException("OTP Expired");
    }

    return true;
  }

  async markOtpAsUsed(otp: VerifyOtpDto) {
    const pinId = await bcrypt.hash(otp.otpCode, this.otpSaltRounds);

    const otpRecord = await this.otpRepository.findOne({
      where: { phoneNumber: otp.phoneNumber, isActive: true },
    });
    if (!otpRecord) {
      return false;
    }
    await this.otpRepository.update(otpRecord.id, { isActive: false });
    return true;
  }
}
