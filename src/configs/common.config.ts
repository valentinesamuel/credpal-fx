import { registerAs } from "@nestjs/config";

const NODE_ENVIRONMENTS = ["development", "production"];

export default registerAs("common", () => ({
  port: process.env.APP_PORT,
  appName: process.env.APP_NAME,
  appAuthSecret: process.env.APP_AUTH_SECRET,
  appHostName: process.env.APP_HOSTNAME,
  saltRounds: process.env.SALT_ROUNDS,
  appAuthName: process.env.APP_AUTH_NAME,
  corsWhitelist: process.env.CORS_WHITELIST,
  nodeEnv: process.env.NODE_ENV,
  tokenEncryptionKey: process.env.TOKEN_ENCRYPTION_KEY,
  isDevelopment: process.env.NODE_ENV === NODE_ENVIRONMENTS["development"],
  swaggerApiRoot: process.env.SWAGGER_API_ROOT,
  jwt: {
    authSecret: process.env.AUTH_SECRET,
  },
  redis: {
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    url: process.env.REDIS_URL,
  },
  logging: {
    enableFileLogging: process.env.ENABLE_FILE_LOGGING,
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
