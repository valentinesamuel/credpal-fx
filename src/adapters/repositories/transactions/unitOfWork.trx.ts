import { Injectable } from "@nestjs/common";
import { DataSource, QueryRunner } from "typeorm";
import { AppLogger } from "@shared/observability/logger";

@Injectable()
export class UnitOfWork {
  private readonly logger = new AppLogger(UnitOfWork.name);
  private queryRunner: QueryRunner | null = null;
  private transactionCount = 0;

  constructor(private dataSource: DataSource) {}

  async start(): Promise<QueryRunner> {
    // Support nested transaction calls
    if (this.queryRunner && this.transactionCount > 0) {
      this.transactionCount++;
      return this.queryRunner;
    }

    this.queryRunner = this.dataSource.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
    this.transactionCount = 1;
    return this.queryRunner;
  }

  getManager() {
    if (!this.queryRunner || this.transactionCount === 0) {
      throw new Error("Transaction not started");
    }
    return this.queryRunner.manager;
  }

  async complete(): Promise<void> {
    if (!this.queryRunner) {
      throw new Error("No active transaction");
    }

    // Only commit the outermost transaction
    this.transactionCount--;
    if (this.transactionCount === 0) {
      await this.queryRunner.commitTransaction();
      await this.queryRunner.release();
      this.queryRunner = null;
    }
  }

  async rollback(): Promise<void> {
    if (!this.queryRunner) {
      return; // No transaction to rollback
    }

    try {
      await this.queryRunner.rollbackTransaction();
      await this.queryRunner.release();
    } catch (error) {
      this.logger.error(
        `Error during transaction rollback: ${error.message}`,
        error.stack,
      );
    } finally {
      this.queryRunner = null;
      this.transactionCount = 0;
    }
  }

  async executeInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const wasOuterTransaction = this.transactionCount === 0;

    try {
      await this.start();
      const result = await operation();
      await this.complete();
      return result;
    } catch (error) {
      // Only rollback if this is the outermost transaction
      if (wasOuterTransaction) {
        await this.rollback();
      } else {
        // Just decrement the counter for nested transactions
        this.transactionCount--;
      }
      throw error;
    }
  }
}
