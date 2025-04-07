import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  BaseSMSResponse,
  SendSMSParams,
  SMSNotificationInterface,
} from "../sms.interface";
import * as twilio from "twilio";
import { AppLogger } from "@shared/observability/logger";

@Injectable()
export class TwilioProvider
  implements SMSNotificationInterface<BaseSMSResponse>
{
  private readonly logger = new AppLogger(TwilioProvider.name);
  private readonly twilioClient: twilio.Twilio;
  private readonly WHATSAPP_FROM: string;
  private readonly FROM: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>(
      "notification.sms.twilio.accountSid",
    );
    const authToken = this.configService.get<string>(
      "notification.sms.twilio.authToken",
    );
    this.WHATSAPP_FROM = this.configService.get<string>(
      "notification.sms.twilio.whatsappFrom",
    );
    this.FROM = this.configService.get<string>("notification.sms.twilio.from");
    this.twilioClient = twilio(accountSid, authToken);
  }

  async sendSMS(params: SendSMSParams): Promise<BaseSMSResponse | any> {
    try {
      const response = await this.twilioClient.messages.create({
        body: params.message,
        from: this.FROM,
        to: params.to,
      });

      this.logger.log("✅ Twilio API request successful:", response);
      return {
        status: "success",
        message: response,
      };
      // console.log("✅ Twilio API request successful:", params);
    } catch (error) {
      this.logger.error("❌ Twilio API request failed:", error.message);
      return {
        status: "failed",
        message: error.message,
      };
    }
  }

  async sendWhatsappMessage(
    params: SendSMSParams,
  ): Promise<BaseSMSResponse | any> {
    try {
      const response = await this.twilioClient.messages.create({
        body: params.message,
        from: this.WHATSAPP_FROM,
        to: `whatsapp:${params.to}`,
      });

      this.logger.log("✅ Twilio WhatsApp API request successful:", response);
      return {
        status: "success",
        message: response,
      };
    } catch (error) {
      this.logger.error(
        "❌ Twilio WhatsApp API request failed:",
        error.message,
      );
      return {
        status: "failed",
        message: error.message,
      };
    }
  }
}
