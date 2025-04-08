import { TransactionRepository } from "@adapters/repositories/transaction.repository";
import { Injectable } from "@nestjs/common";
import { Transaction } from "../entities/transaction.entity";

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async createTransaction(
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    return this.transactionRepository.createTransaction(transactionData);
  }

  async findTransaction(
    filter: Partial<Pick<Transaction, "id">>,
  ): Promise<Transaction> {
    return this.transactionRepository.findTransaction(filter);
  }

  async updateTransaction(
    id: string,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    return this.transactionRepository.updateTransaction(id, transactionData);
  }
}
