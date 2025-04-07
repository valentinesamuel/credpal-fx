import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppLogger } from "@shared/observability/logger";
import { Logger } from "@nestjs/common";
import { ResponseInterceptor } from "@shared/interceptors/response.interceptor";
import { setupTelemetry } from "@shared/observability/tracing";
import { TraceInterceptor } from "@shared/interceptors/trace.interceptor";
import { CustomFieldValidationPipe } from "@shared/validations/custom.validation";
import { AuthorizationGuard } from "@shared/guards/authorization.guard";

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
  setupTelemetry();
  const logger = new AppLogger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  logger.setFileLogging(configService.get("common.logging.enableFileLogging"));

  setUpCORS(app, configService);

  app.useGlobalPipes(CustomFieldValidationPipe);

  app.useGlobalGuards(new AuthorizationGuard(configService));

  app.useGlobalInterceptors(new TraceInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());

  buildAPIDocumentation(app, configService);

  await app.listen(configService.get("common.port"));

  logger.log(
    `${PRODUCT_NAME} running on port ${configService.get("common.port")}: visit http://localhost:${configService.get("common.port")}/${configService.get("common.swaggerApiRoot")}`,
  );
}

bootstrap().catch((err) => {
  const logger = new AppLogger("Bootstrap");
  logger.error({
    message: "Unhandled startup error",
    error: err,
    errorType: "startup_error",
    errorStack: err.stack,
    errorName: err.name,
    errorDetails: err["errors"],
  });
  process.exit(1);
});
