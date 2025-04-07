import { EmailInterface } from "@adapters/email/email.interface";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "@shared/observability/logger";
import * as nodemailer from "nodemailer";

@Injectable()
export class GmailProvider implements EmailInterface {
  private readonly logger = new AppLogger(GmailProvider.name);

  private readonly EMAIL_FROM: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.EMAIL_FROM = this.configService.get<string>(
      "notification.email.gmail.smtpFrom",
    );
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: this.EMAIL_FROM,
        subject: "Welcome to Our App!",
        html: `
          <div>
            <h1>Welcome ${firstName}!</h1>
            <p>Thank you for registering with our application.</p>
          </div>
        `,
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${email}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    try {
      const resetUrl = `https://credpalfx.com/reset-password?token=${resetToken}`;

      await this.mailerService.sendMail({
        to: email,
        from: this.EMAIL_FROM,
        subject: "Password Reset Request",
        html: `
          <div>
            <h1>Password Reset</h1>
            <p>You requested a password reset. Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}`,
        error.stack,
      );
      throw error;
    }
  }
}
