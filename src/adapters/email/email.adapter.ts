import { EmailInterface, EmailProviderEnum } from "./email.interface";
import { GmailProvider } from "./providers/gmail.provider";
import { AppLogger } from "@shared/observability/logger";

export class EmailAdapter {
  private emailProvider: EmailInterface;
  private readonly logger = new AppLogger(EmailAdapter.name);
  constructor(private readonly gmailProvider: GmailProvider) {}

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    this.initializeProviders(EmailProviderEnum.GMAIL);
    await this.emailProvider.sendWelcomeEmail(email, firstName);
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    this.initializeProviders(EmailProviderEnum.GMAIL);
    await this.emailProvider.sendPasswordResetEmail(email, resetToken);
  }

  async sendOtpEmail(email: string, otpCode: string): Promise<void> {
    this.initializeProviders(EmailProviderEnum.GMAIL);
    await this.emailProvider.sendOtpEmail(email, otpCode);
  }

  private initializeProviders(emailProvider: EmailProviderEnum) {
    switch (emailProvider) {
      case EmailProviderEnum.GMAIL:
        this.emailProvider = this.gmailProvider;
        break;
      default:
        this.logger.error("❌ Invalid email provider.");
        throw new Error("Invalid email provider.");
    }
  }
}
