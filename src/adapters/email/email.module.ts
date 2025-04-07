import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EmailAdapter } from "./email.adapter";
import { GmailProvider } from "./providers/gmail.provider";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>("notification.email.gmail.smtpHost"),
          secure: true,
          port: Number(configService.get("notification.email.gmail.smtpPort")),
          auth: {
            user: configService.get<string>(
              "notification.email.gmail.smtpUser",
            ),
            pass: configService.get<string>(
              "notification.email.gmail.smtpPassword",
            ),
          },
        },
        defaults: {
          from: configService.get<string>("notification.email.gmail.smtpFrom"),
        },
      }),
    }),
  ],
  providers: [EmailAdapter, GmailProvider],
  exports: [EmailAdapter],
})
export class EmailModule {}
