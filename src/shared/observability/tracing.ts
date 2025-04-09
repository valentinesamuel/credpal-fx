import { NodeSDK, resources } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
} from "@opentelemetry/sdk-logs";
import { logs } from "@opentelemetry/api-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { Resource } from "@opentelemetry/resources";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";
import * as dotenv from "dotenv";

dotenv.config();

const resource: Resource = {
  attributes: {
    [ATTR_SERVICE_NAME]: "nestjs-app",
    [ATTR_SERVICE_VERSION]: "1.0.0",
  },
  asyncAttributesPending: false,
  getRawAttributes: () => [],
  merge: (other: Resource | null) => other || this,
  waitForAsyncAttributes: () => Promise.resolve(),
};

export function setupTelemetry() {
  const sdk = new NodeSDK({
    resource: resource,
    traceExporter: new OTLPTraceExporter({
      url: "http://localhost:4316/v1/traces",
      headers: {},
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: "http://localhost:4316/v1/metrics",
      }),
    }),
    instrumentations: [
      getNodeAutoInstrumentations(),
      new NestInstrumentation({
        enabled: true,
      }),
    ],
  });

  // Set up logs
  const loggerProvider = new LoggerProvider({
    resource: resource,
  });

  const logExporter = new OTLPLogExporter({
    url: "http://localhost:4316/v1/logs",
  });

  loggerProvider.addLogRecordProcessor(
    new SimpleLogRecordProcessor(logExporter),
  );
  logs.setGlobalLoggerProvider(loggerProvider);

  // Start the SDK
  if (process.env.ENABLE_FILE_LOGGING === "true") {
    sdk.start();
  }

  // Handle shutdown gracefully
  const shutdown = () => {
    sdk
      .shutdown()
      .then(() => console.log("Tracing and metrics terminated"))
      .catch((error) =>
        console.log("Error terminating tracing and metrics", error),
      )
      .finally(() => process.exit(0));
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
