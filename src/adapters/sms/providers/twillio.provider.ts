import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  BaseSMSResponse,
  SendSMSParams,
  SMSNotificationInterface,
} from "../sms.interface";
import * as twilio from "twilio";

@Injectable()
export class TwilioProvider
  implements SMSNotificationInterface<BaseSMSResponse>
{
  private readonly logger = new Logger(TwilioProvider.name);
  private readonly twilioClient;
  private readonly MESSAGING_SERVICE_SID: string;
  private readonly WHATSAPP_FROM: string;

  constructor(private readonly configService: ConfigService) {
    const accountSid = this.configService.get<string>(
      "notification.sms.twilio.accountSid",
    );
    const authToken = this.configService.get<string>(
      "notification.sms.twilio.authToken",
    );
    this.MESSAGING_SERVICE_SID = this.configService.get<string>(
      "notification.sms.twilio.messagingServiceSid",
    );
    this.WHATSAPP_FROM = this.configService.get<string>(
      "notification.sms.twilio.whatsappFrom",
    );
    this.twilioClient = twilio(accountSid, authToken);
  }

  async sendSMS(params: SendSMSParams): Promise<BaseSMSResponse | any> {
    try {
      const response = await this.twilioClient.messages.create({
        body: params.message,
        from: "CredpalFX",
        messagingServiceSid: this.MESSAGING_SERVICE_SID,
        to: params.to,
      });

      this.logger.log("✅ Twilio API request successful:", response);
      return {
        status: "success",
        message: response,
      };
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
