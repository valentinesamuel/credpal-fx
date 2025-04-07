export enum EmailProviderEnum {
  SENDGRID = "sendgrid",
}

export interface EmailResponse {
  status: boolean;
  message: string;
  provider: EmailProviderEnum;
}

export interface EmailInterface {
  sendMail(params: ISendMailParams): Promise<EmailResponse>;
}

export interface ISendMailParams {
  to: string | string[];
  from: string;
  subject: string;
  text?: string;
  html?: string;
}
