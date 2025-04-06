import { registerAs } from "@nestjs/config";

const NODE_ENVIRONMENTS = ["development", "production"];

export default registerAs("common", () => ({
  port: process.env.APP_PORT || 3000,
  appName: process.env.APP_NAME,
  appHostName: process.env.APP_HOSTNAME,
  nodeEnv: process.env.NODE_ENV,
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
  isDevelopment: process.env.NODE_ENV === NODE_ENVIRONMENTS["development"],
  swaggerApiRoot: process.env.SWAGGER_API_ROOT,
  redis: {
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    url: process.env.REDIS_URL,
  },
  auth: {
    authName: process.env.APP_AUTH_NAME,
  },
  encryption: {
    algorithm: process.env.ENCRYPTION_ALGORITHM,
    ivLength: process.env.ENCRYPTION_IV_LENGTH,
    key: process.env.ENCRYPTION_KEY,
  },
}));
