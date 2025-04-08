import { TransactionRepository } from "@adapters/repositories/transaction.repository";
import { Injectable } from "@nestjs/common";
import { Transaction } from "../entities/transaction.entity";
import { EntityManager } from "typeorm";

@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly entityManager: EntityManager,
  ) {}

  async createTransaction(
    transactionData: Partial<Transaction>,
    transactionEntityManager?: EntityManager,
  ): Promise<Transaction> {
    const manager = transactionEntityManager || this.entityManager;
    return this.transactionRepository.createTransaction(
      transactionData,
      manager,
    );
  }

  async findTransaction(
    filter: Partial<Pick<Transaction, "id">>,
    transactionEntityManager?: EntityManager,
  ): Promise<Transaction> {
    const manager = transactionEntityManager || this.entityManager;
    return this.transactionRepository.findTransaction(filter, manager);
  }

  async updateTransaction(
    id: string,
    transactionData: Partial<Transaction>,
    transactionEntityManager?: EntityManager,
  ): Promise<Transaction> {
    const manager = transactionEntityManager || this.entityManager;
    return this.transactionRepository.updateTransaction(
      id,
      transactionData,
      manager,
    );
  }
}
