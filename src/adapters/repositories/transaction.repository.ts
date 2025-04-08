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
  ): Promise<Transaction> {
    const transaction = this.create(transactionData);
    return this.save(transaction);
  }

  async findTransaction(
    filter: Partial<Pick<Transaction, "id">>,
  ): Promise<Transaction> {
    return this.findOne({
      where: {
        id: filter.id,
      },
    });
  }

  async updateTransaction(
    id: string,
    transactionData: Partial<Transaction>,
  ): Promise<Transaction> {
    await this.update({ id }, transactionData);
    return this.findTransaction({
      id,
    });
  }
}
