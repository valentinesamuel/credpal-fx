export type SendSMSParams = {
  to: string;
  from: string;
  message: string;
};

export type BaseSMSResponse = {
  status: string;
  message: any;
};

export enum SMSProviderEnum {
  TWILIO = "twilio",
}

export interface SMSNotificationInterface<
  TSMSResponse extends BaseSMSResponse,
> {
  sendSMS(
    params: SendSMSParams,
    provider?: SMSProviderEnum,
  ): Promise<TSMSResponse>;
}
