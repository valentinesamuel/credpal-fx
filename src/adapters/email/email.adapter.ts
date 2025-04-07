import { ConfigRepository } from "@adapters/repositories/config.repository";
import {
  EmailInterface,
  EmailProviderEnum,
  EmailResponse,
  ISendMailParams,
} from "./email.interface";
("./providers/sendgrid.provider");
import { AppLogger } from "@shared/observability/logger";
import {
  Config,
  DestinationTypeEnum,
} from "@modules/core/entities/config.entity";
import { Injectable } from "@nestjs/common";
import { SendGridProvider } from "./providers/sendgrid.provider";

@Injectable()
export class EmailAdapter implements EmailInterface {
  private emailProvider: EmailInterface;
  private readonly logger = new AppLogger(EmailAdapter.name);
  private readonly config: Promise<Config>;
  constructor(
    private readonly sendGridProvider: SendGridProvider,
    private readonly configRepository: ConfigRepository,
  ) {
    this.config = this.configRepository.findConfig({
      where: { type: DestinationTypeEnum.EMAIL, isActive: true },
    });
  }

  async sendMail(params: ISendMailParams): Promise<EmailResponse> {
    const config = await this.config;
    this.initializeProviders(config?.provider ?? EmailProviderEnum.SENDGRID);
    return await this.emailProvider.sendMail(params);
  }

  private initializeProviders(emailProvider: string) {
    switch (emailProvider) {
      case EmailProviderEnum.SENDGRID:
        this.emailProvider = this.sendGridProvider;
        break;
      default:
        this.logger.error("❌ Invalid email provider.");
        throw new Error("Invalid email provider.");
    }
  }
}
