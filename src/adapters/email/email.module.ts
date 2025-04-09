import { Module } from "@nestjs/common";
import { EmailAdapter } from "./email.adapter";
import { SendGridProvider } from "./providers/sendgrid.provider";
import { Config } from "@modules/core/entities/config.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigRepository } from "@adapters/repositories/config.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Config])],
  providers: [EmailAdapter, SendGridProvider, ConfigRepository],
  exports: [EmailAdapter],
})
export class EmailModule {}
