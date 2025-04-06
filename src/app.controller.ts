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
    const users = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ];
    const span = trace.getSpan(context.active());
    const getUsersSpan = this.tracer.startSpan("get_users_span", {
      links: span ? [{ context: span.spanContext() }] : [],
    });
    context.with(trace.setSpan(context.active(), getUsersSpan), () => {
      getUsersSpan.end();
    });
    return users;
  }
}
