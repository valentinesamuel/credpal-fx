import { trace } from "@opentelemetry/api";

export function Trace(name?: string) {
  const tracer = trace.getTracer("nestjs-traces");

  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const spanName = name || `${target.constructor.name}.${propertyKey}`;
      return tracer.startActiveSpan(spanName, (span) => {
        try {
          span.setAttribute("class", target.constructor.name);
          span.setAttribute("method", propertyKey);
          return originalMethod.apply(this, args);
        } finally {
          span.end();
        }
      });
    };

    return descriptor;
  };
}
