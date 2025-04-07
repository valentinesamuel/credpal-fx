import {
  EmailInterface,
  EmailProviderEnum,
  ISendMailParams,
} from "@adapters/email/email.interface";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sgMail from "@sendgrid/mail";
import { AppLogger } from "@shared/observability/logger";

@Injectable()
export class SendGridProvider implements EmailInterface {
  private readonly SENDGRID_API_KEY: string;
  private readonly logger = new AppLogger(SendGridProvider.name);
  private readonly EMAIL_FROM: string;

  constructor(private readonly configService: ConfigService) {
    this.EMAIL_FROM = this.configService.get<string>(
      "notification.email.sendgrid.from",
    );
    this.SENDGRID_API_KEY = this.configService.get<string>(
      "notification.email.sendgrid.sgMailApiKey",
    );
    sgMail.setApiKey(this.SENDGRID_API_KEY);
  }

  async sendMail(params: ISendMailParams) {
    try {
      const msg = {
        to: params.to,
        from: this.EMAIL_FROM,
        subject: params.subject,
        text: params.text,
        html: params.html,
      };

      const [response] = await sgMail.send(msg);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          status: true,
          message: `Email sent successfully via SendGrid. Message ID: ${response.headers["x-message-id"]}`,
          provider: EmailProviderEnum.SENDGRID,
        };
      } else {
        this.logger.error(
          `Failed to send email via SendGrid. Response: ${JSON.stringify(response)}`,
        );
        return {
          status: false,
          message: `Failed to send email via SendGrid. Status Code: ${response.statusCode}`,
          provider: EmailProviderEnum.SENDGRID,
        };
      }
    } catch (error) {
      this.logger.error("SendGrid email error", error);
      return {
        status: false,
        message: `SendGrid email error: ${error.message}`,
        provider: EmailProviderEnum.SENDGRID,
      };
    }
  }
}
