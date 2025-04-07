import { Module } from "@nestjs/common";
import { SMSAdapter } from "./sms.adapter";
import { TwilioProvider } from "./providers/twillio.provider";

@Module({
  providers: [SMSAdapter, TwilioProvider],
  exports: [SMSAdapter],
})
export class SMSModule {}
