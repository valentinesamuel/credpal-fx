import { Injectable, Logger } from "@nestjs/common";
import {
  BaseSMSResponse,
  SMSNotificationInterface,
  SMSProviderEnum,
  SendSMSParams,
} from "./sms.interface";
import { TwilioProvider } from "./providers/twillio.provider";

@Injectable()
export class SMSAdapter implements SMSNotificationInterface<BaseSMSResponse> {
  private readonly logger = new Logger(SMSAdapter.name);
  private SMSProvider: SMSNotificationInterface<BaseSMSResponse>;

  constructor(private readonly twilioProvider: TwilioProvider) {}

  async sendSMS(
    params: SendSMSParams,
    provider?: SMSProviderEnum,
  ): Promise<BaseSMSResponse> {
    this.initializeProvider(provider ?? SMSProviderEnum.TWILIO);
    if (!this.SMSProvider) {
      this.logger.log("❌ Invalid notification provider");
      return {
        status: "failed",
        message: "Invalid notification provider",
      };
    }
    return this.SMSProvider.sendSMS(params);
  }

  private initializeProvider(smsProvider: SMSProviderEnum) {
    switch (smsProvider) {
      case SMSProviderEnum.TWILIO:
        this.SMSProvider = this.twilioProvider;
        break;
      default:
        this.SMSProvider = null;
    }
  }
}
