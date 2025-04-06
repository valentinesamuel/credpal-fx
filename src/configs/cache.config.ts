import { registerAs } from "@nestjs/config";

export default registerAs("cache", () => ({
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  url: process.env.REDIS_URL,
}));
