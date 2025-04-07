export enum EmailProviderEnum {
  GMAIL = "gmail",
}

export interface EmailInterface {
  sendWelcomeEmail(email: string, firstName: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
  sendOtpEmail(email: string, otpCode: string): Promise<void>;
}

export interface ISendMailParams {
  to: string | string[];
  from: string;
}
