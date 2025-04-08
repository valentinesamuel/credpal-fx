import { Injectable, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Wallet } from "@modules/core/entities/wallet.entity";
import { WalletBalance } from "@modules/core/entities/walletBalance.entity";
import { BaseRepository } from "./transactions/base.repository";
import { UnitOfWork } from "./transactions/unitOfWork.trx";

@Injectable()
export class WalletRepository extends BaseRepository<Wallet> {
  private readonly logger = new Logger(WalletRepository.name);

  constructor(
    @InjectRepository(Wallet)
    walletRepository: Repository<Wallet>,
    @InjectRepository(WalletBalance)
    private readonly walletBalanceRepository: Repository<WalletBalance>,
    unitOfWork: UnitOfWork,
  ) {
    super(walletRepository, unitOfWork);
  }

  async findWalletBalance(
    filter: Partial<Pick<WalletBalance, "id" | "walletId" | "currencyId">>,
  ): Promise<WalletBalance> {
    return this.walletBalanceRepository.findOne({
      where: filter,
    });
  }

  async createWallet(walletData: Partial<Wallet>): Promise<Wallet> {
    const wallet = this.create(walletData);
    return this.save(wallet);
  }

  async createWalletBalance(
    walletBalanceData: Partial<WalletBalance>,
  ): Promise<WalletBalance> {
    const walletBalance =
      this.walletBalanceRepository.create(walletBalanceData);
    return this.manager.save(walletBalance);
  }

  async findWallet(
    filter: Partial<Pick<Wallet, "id" | "userId">>,
  ): Promise<Wallet> {
    return this.findOne({
      where: [{ id: filter.id }, { userId: filter.userId }],
      relations: ["balances", "balances.currency"],
    });
  }

  async updateWallet(id: string, walletData: Partial<Wallet>): Promise<Wallet> {
    await this.update({ id }, walletData);
    return this.findWallet({ id });
  }

  async updateWalletBalance(
    id: string,
    walletBalanceData: Partial<WalletBalance>,
  ) {
    await this.walletBalanceRepository.update({ id }, walletBalanceData);
    return this.findWalletBalance({ id });
  }
}
