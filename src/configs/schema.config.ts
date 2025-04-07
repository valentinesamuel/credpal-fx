import * as Joi from "joi";

const NODE_ENVIRONMENTS: string[] = ["local", "development", "production"];
const DEFAULT_NODE_ENV: string = NODE_ENVIRONMENTS[0];
const DEFAULT_APP_PORT: number = 3005;
const DEFAULT_DATABASE_PORT: number = 5432;
const DEFAULT_REDIS_PORT: number = 6379;
const IS_DEVELOPMENT_DEFAULT: boolean = false;
const DEFAULT_DATABASE_RETRY_ATTEMPTS: number = 5;

export default {
  envFilePath: [".local.env", ".env.development", ".env.production", ".env"],
  cache: true,
  isGlobal: true,
  validationOptions: {
    allowUnknown: true,
    abortEarly: true,
  },
  validationSchema: Joi.object({
    // common
    PORT: Joi.number().default(DEFAULT_APP_PORT),
    APP_NAME: Joi.string().required(),
    APP_HOSTNAME: Joi.string().required(),
    CORS_WHITELIST: Joi.string().required(),
    APP_AUTH_NAME: Joi.string().required(),
    SALT_ROUNDS: Joi.number().required(),
    APP_AUTH_SECRET: Joi.string().required(),
    NODE_ENV: Joi.string()
      .valid(...NODE_ENVIRONMENTS)
      .default(DEFAULT_NODE_ENV),
    IS_DEVELOPMENT: Joi.boolean().default(IS_DEVELOPMENT_DEFAULT),

    // jwt
    AUTH_SECRET: Joi.string().required(),

    // Encryption
    ENCRYPTION_KEY: Joi.string().required(),
    ENCRYPTION_IV_LENGTH: Joi.number().required(),
    ENCRYPTION_ALGORITHM: Joi.string().required(),

    // typeorm
    DATABASE_TYPE: Joi.string().required(),
    DATABASE_DB: Joi.string().required(),
    DATABASE_HOST: Joi.string().required(),
    DATABASE_PORT: Joi.number().integer().default(DEFAULT_DATABASE_PORT),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_LOGGING: Joi.boolean().default(false),
    DATABASE_SYNC: Joi.boolean().when("NODE_ENV", {
      is: Joi.string().equal(DEFAULT_NODE_ENV),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false),
    }),
    DATABASE_RETRY_ATTEMPTS: Joi.number().default(
      DEFAULT_DATABASE_RETRY_ATTEMPTS,
    ),

    // logging
    ENABLE_FILE_LOGGING: Joi.boolean().required(),

    // swagger
    SWAGGER_API_ROOT: Joi.string().required(),

    // cache
    REDIS_PORT: Joi.number().default(DEFAULT_REDIS_PORT),
    REDIS_PASSWORD: Joi.string().allow(""),
    REDIS_URL: Joi.string().required(),
  }),
};
