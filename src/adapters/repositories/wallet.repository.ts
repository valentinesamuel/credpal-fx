import { Injectable, Logger } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Wallet } from "@modules/core/entities/wallet.entity";
import { WalletBalance } from "@modules/core/entities/walletBalance.entity";

@Injectable()
export class WalletRepository extends Repository<Wallet> {
  private readonly logger = new Logger(WalletRepository.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletBalance)
    private readonly walletBalanceRepository: Repository<WalletBalance>,
    private readonly entityManager: EntityManager,
  ) {
    super(
      walletRepository.target,
      walletRepository.manager,
      walletRepository.queryRunner,
    );
  }

  async createWallet(
    walletData: Partial<Wallet>,
    transactionEntityManager?: EntityManager,
  ): Promise<Wallet> {
    const manager = transactionEntityManager || this.entityManager;
    const wallet = this.create(walletData);
    return manager.save(wallet);
  }

  async createWalletBalance(
    walletBalanceData: Partial<WalletBalance>,
    transactionEntityManager?: EntityManager,
  ): Promise<WalletBalance> {
    const manager = transactionEntityManager || this.entityManager;
    const walletBalance =
      this.walletBalanceRepository.create(walletBalanceData);
    return manager.save(walletBalance);
  }

  async findWallet(
    filter: Partial<Pick<Wallet, "id" | "userId">>,
    transactionEntityManager?: EntityManager,
  ): Promise<Wallet> {
    const manager = transactionEntityManager || this.entityManager;
    return manager.findOne(Wallet, {
      where: [{ id: filter.id }, { userId: filter.userId }],
    });
  }

  async updateWallet(
    id: string,
    walletData: Partial<Wallet>,
    transactionEntityManager?: EntityManager,
  ): Promise<Wallet> {
    const manager = transactionEntityManager || this.entityManager;
    await manager.update(Wallet, { id }, walletData);
    return this.findWallet({ id }, transactionEntityManager);
  }
}
