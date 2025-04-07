import { registerAs } from "@nestjs/config";

export default registerAs("notification", () => ({
  sms: {
    twilio: {
      authToken: process.env.TWILIO_AUTH_TOKEN,
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      from: process.env.TWILIO_FROM,
      messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
      whatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
    },
  },
  email: {
    gmail: {
      smtpHost: process.env.GMAIL_SMTP_HOST,
      smtpPort: parseInt(process.env.GMAIL_SMTP_PORT, 10),
      smtpUsername: process.env.GMAIL_SMTP_USERNAME,
      smtpPassword: process.env.GMAIL_SMTP_PASSWORD,
      smtpFrom: process.env.GMAIL_SMTP_FROM,
    },
  },
}));
