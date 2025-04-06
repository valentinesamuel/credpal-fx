import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { context, trace, SpanStatusCode } from "@opentelemetry/api";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  private readonly tracer = trace.getTracer("nestjs-app");

  intercept(
    executionContext: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const req = executionContext.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;

    if (url === "/metrics") {
      return next.handle();
    }

    const span = this.tracer.startSpan(`${method} ${url}`, {
      attributes: {
        "http.method": method,
        "http.url": url,
        "http.route": url,
        "service.name": "nestjs-app",
        "span.kind": "server",
      },
    });

    return context.with(trace.setSpan(context.active(), span), () => {
      const start = Date.now();
      return next.handle().pipe(
        tap({
          next: (data) => {
            const duration = Date.now() - start;
            span.setAttribute("http.status_code", 200);
            span.setAttribute("duration_ms", duration);
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();
          },
          error: (error) => {
            const duration = Date.now() - start;
            span.setAttribute("duration_ms", duration);
            span.setAttribute("http.status_code", error.status || 500);
            span.setAttribute("error", true);
            span.setStatus({
              code: SpanStatusCode.ERROR,
              message: error.message,
            });
            span.recordException(error);
            span.end();
          },
        }),
      );
    });
  }
}
