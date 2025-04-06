import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ResponseInterceptor } from "@shared/interceptors/response.interceptor";

const PRODUCT_NAME = "Credpal FX";
const PRODUCT_TAG = "Credpal FX";
const PRODUCT_VERSION = "1.0.0";

function setUpCORS(app, configService: ConfigService) {
  // Determine the allowed origins
  const whitelist = configService
    .get<string>("common.corsWhitelist")
    .split(",")
    .map((pattern) => new RegExp(pattern));

  // Enable localhost on dev/staging servers only
  if ([undefined, "development", "localhost"].includes(process.env.NODE_ENV)) {
    whitelist.push(/http(s)?:\/\/localhost:/);
  }

  Logger.log(`Approved domains: ${whitelist.join(",")}`);

  const options = {
    origin: whitelist,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-control",
    ],
  };

  app.enableCors(options);
}

function buildAPIDocumentation(app, configService: ConfigService) {
  const swaggerOptions = new DocumentBuilder()
    .setTitle(`${PRODUCT_NAME} API Documentation`)
    .setDescription("List of all the APIs for Credpal FX.")
    .setVersion(PRODUCT_VERSION)
    .addTag(PRODUCT_TAG)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup(
    configService.get("common.swaggerApiRoot"),
    app,
    document,
  );
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  setUpCORS(app, configService);

  app.useGlobalInterceptors(new ResponseInterceptor());

  buildAPIDocumentation(app, configService);

  await app.listen(configService.get("common.port"));

  Logger.log(
    `${PRODUCT_NAME} running on port ${configService.get("common.port")}: visit http://localhost:${configService.get("common.port")}/${configService.get("common.swaggerApiRoot")}`,
  );
}

bootstrap().catch((error) => {
  Logger.error("Unhandled startup error", error);
  process.exit(1);
});
