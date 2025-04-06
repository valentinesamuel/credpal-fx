import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Response, Request } from "express";
import { ValidationError } from "class-validator";
import { AppLogger } from "@shared/observability/logger";

export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  result: T;
  path: string;
  duration: number;
};

function extractValidationErrors(
  errors: ValidationError[],
  parentPath = "",
): any[] {
  const result: any[] = [];

  for (const error of errors) {
    const propertyPath = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;

    if (error.constraints) {
      result.push({
        field: propertyPath,
        errors: Object.values(error.constraints),
      });
    }

    if (error.children && error.children.length > 0) {
      result.push(...extractValidationErrors(error.children, propertyPath));
    }
  }

  return result;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, TResponse<T>>
{
  private readonly logger = new AppLogger(ResponseInterceptor.name);
  constructor() {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TResponse<T>> {
    const startTime = Date.now();
    return next.handle().pipe(
      map((res: unknown) => this.responseHandler(res, context, startTime)),
      catchError((err: HttpException) =>
        throwError(() => this.errorHandler(err, context, startTime)),
      ),
    );
  }

  // Handles success response
  responseHandler(res: any, context: ExecutionContext, startTime: number) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const statusCode = response.statusCode;

    console.log(res);

    if (request.url !== "/metrics") {
      this.logger.info("Request successful", {
        statusCode,
        success: true,
        message: "Request successful",
        path: `${request.protocol}://${request.get("host")}${request.url}`,
        method: request.method,
        duration: Date.now() - startTime,
      });
    }

    return {
      statusCode,
      success: true,
      message: "Request successful",
      result: res,
      path: request.url,
      duration: Date.now() - startTime,
    };
  }

  errorHandler(exception: any, context: ExecutionContext, startTime: number) {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const message = exception?.getResponse
      ? exception.getResponse().message
      : exception.message;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Handle validation errors specifically
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === "object" &&
        Array.isArray(exceptionResponse["message"])
      ) {
        // Class-validator errors detected (array of ValidationError)
        const responseMsr = extractValidationErrors(
          exceptionResponse["message"],
        );

        this.logger.error("Bad Request", "", {
          statusCode: status,
          success: false,
          message: "Bad Request",
          error: responseMsr,
          errorStack: exception.stack,
          errorName: exception.name,
          errorDetails: exception,
          url: `${request.protocol}://${request.get("host")}${request.url}`,
          method: request.method,
          duration: Date.now() - startTime,
        });

        return response.status(status).json({
          statusCode: status,
          success: false,
          message: "Bad Request",
          error: responseMsr,
          path: request.path,
          duration: Date.now() - startTime,
        });
      }
    }

    // Fallback for non-validation errors
    this.logger.error("Request failed", "", {
      statusCode: status,
      success: false,
      message: message ?? "Request failed",
      error: exception,
      errorStack: exception.stack,
      errorName: exception.name,
      errorDetails: exception,
      url: `${request.protocol}://${request.get("host")}${request.url}`,
      method: request.method,
      duration: Date.now() - startTime,
    });

    return response.status(status).json({
      statusCode: status,
      success: false,
      message: message ?? "Request failed",
      errors: [],
      path: request.url,
      duration: Date.now() - startTime,
    });
  }
}
