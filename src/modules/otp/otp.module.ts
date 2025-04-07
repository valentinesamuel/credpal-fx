import { EmailModule } from "@adapters/email/email.module";
import { OtpRepository } from "@adapters/repositories/otp.repository";
import { SMSModule } from "@adapters/sms/sms.module";
import { Otp } from "@modules/core/entities/otp.entity";
import { OtpService } from "@modules/core/services/otp.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Otp]), SMSModule, EmailModule],
  providers: [OtpService, OtpRepository],
  exports: [OtpService],
})
export class OtpModule {}
