import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core";

const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:3200/v1/traces",
});

const sdk = new NodeSDK({
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [
    getNodeAutoInstrumentations(),
    new NestInstrumentation({
      enabled: true,
    }),
  ],
});

sdk.start();
