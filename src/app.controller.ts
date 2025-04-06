import { Controller, Get } from "@nestjs/common";
import { AppLogger } from "@shared/observability/logger";
import { context, trace } from "@opentelemetry/api";

@Controller()
export class AppController {
  private readonly tracer = trace.getTracer("nestjs-app");
  private readonly logger = new AppLogger(AppController.name);
  constructor() {}

  @Get()
  getHello() {
    const span = this.tracer.startSpan("getHello", {
      attributes: {
        "service.name": "nestjs-app",
        endpoint: "/getHello",
        "custom.attribute": "test-value",
      },
    });

    try {
      this.logger.log("Processing getHello request");
      const users = [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" },
      ];
      return users;
    } finally {
      span.end(); // Always end the span
    }
  }
}
