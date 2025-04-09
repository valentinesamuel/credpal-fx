import { registerAs } from "@nestjs/config";

export default registerAs("fxRateAPI", () => ({
  exchangeRate: { apiKey: process.env.FX_EXCHANGE_RATE_API_KEY },
  alphaAdvantage: { apiKey: process.env.FX_ALPHA_ADVANTAGE_API_KEY },
}));
