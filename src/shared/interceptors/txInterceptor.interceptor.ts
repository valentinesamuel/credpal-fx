import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { UnitOfWork } from "../../adapters/repositories/transactions/unitOfWork.trx";
import { AppLogger } from "@shared/observability/logger";

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransactionInterceptor.name);
  private readonly WRITE_METHODS = ["POST", "PUT", "PATCH", "DELETE"];
  private readonly TX_HEADER = "x-needs-transaction";

  constructor(private unitOfWork: UnitOfWork) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Record<string, any>>();

    // Only start transactions for write operations or if explicitly marked
    const needsTransaction =
      this.WRITE_METHODS.includes(request.method) ||
      request.headers[this.TX_HEADER] === "true";

    if (!needsTransaction) {
      return next.handle();
    }

    // For write operations, start a transaction
    await this.unitOfWork.start();
    this.logger.debug(
      `Started transaction for ${request.method} ${request.url}`,
    );

    return next.handle().pipe(
      tap((response) => {
        // Success case - complete transaction synchronously before response is sent
        this.unitOfWork
          .complete()
          .then(() => {
            this.logger.debug(`Committed transaction...`);
          })
          .catch((err) => {
            this.logger.error(`Transaction commit failed: ${err.message}`);
          });
        return response;
      }),
      catchError((error) => {
        // Error case - rollback synchronously before error is propagated
        this.unitOfWork
          .rollback()
          .then(() => {
            this.logger.error(`Transaction rolled back...`);
          })
          .catch((err) => {
            this.logger.error(`Rollback failed: ${err.message}`);
          });

        return throwError(() => error);
      }),
    );
  }
}
