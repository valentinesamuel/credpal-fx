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
    sendgrid: {
      from: process.env.SENDGRID_FROM,
      sgMailApiKey: process.env.SENDGRID_MAIL_API_KEY,
    },
  },
}));
