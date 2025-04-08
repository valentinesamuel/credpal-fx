import { Injectable, Logger } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "@modules/core/entities/transaction.entity";

@Injectable()
export class TransactionRepository extends Repository<Transaction> {
  private readonly logger = new Logger(TransactionRepository.name);

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly entityManager: EntityManager,
  ) {
    super(
      transactionRepository.target,
      transactionRepository.manager,
      transactionRepository.queryRunner,
    );
  }

  async createTransaction(
    transactionData: Partial<Transaction>,
    transactionEntityManager?: EntityManager,
  ): Promise<Transaction> {
    const manager = transactionEntityManager || this.entityManager;
    const transaction = this.create(transactionData);
    return manager.save(transaction);
  }

  async findTransaction(
    filter: Partial<Pick<Transaction, "id">>,
    transactionEntityManager?: EntityManager,
  ): Promise<Transaction> {
    const manager = transactionEntityManager || this.entityManager;
    return manager.findOne(Transaction, {
      where: {
        id: filter.id,
      },
    });
  }

  async updateTransaction(
    id: string,
    transactionData: Partial<Transaction>,
    transactionEntityManager?: EntityManager,
  ): Promise<Transaction> {
    const manager = transactionEntityManager || this.entityManager;
    await manager.update(Transaction, { id }, transactionData);
    return this.findTransaction({
      id,
    });
  }
}
