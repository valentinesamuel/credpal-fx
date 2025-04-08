import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "@modules/core/entities/transaction.entity";
import { TransactionService } from "@modules/core/services/transaction.service";
import { TransactionRepository } from "@adapters/repositories/transaction.repository";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [TransactionService, TransactionRepository],
  exports: [TransactionService],
})
export class TransactionModule {}
