import { Injectable, Logger } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Wallet } from "@modules/core/entities/wallet.entity";
import { WalletBalance } from "@modules/core/entities/walletBalance.entity";
import { BaseRepository } from "./transactions/base.repository";
import { UnitOfWork } from "./transactions/unitOfWork.trx";

@Injectable()
export class WalletBalanceRepository extends BaseRepository<WalletBalance> {
  private readonly logger = new Logger(WalletBalanceRepository.name);

  constructor(
    @InjectRepository(WalletBalance)
    walletBalanceRepository: Repository<WalletBalance>,
    unitOfWork: UnitOfWork,
  ) {
    super(walletBalanceRepository, unitOfWork);
  }

  async findWalletBalance(
    filter: Partial<Pick<WalletBalance, "id" | "walletId" | "currencyId">>,
  ): Promise<WalletBalance> {
    return this.findOne({
      where: filter,
    });
  }

  async createWalletBalance(
    walletBalanceData: Partial<WalletBalance>,
  ): Promise<WalletBalance> {
    const walletBalance = this.create(walletBalanceData);
    return this.save(walletBalance);
  }

  async findWalletBalanceByData(
    filter: Partial<Pick<WalletBalance, "id" | "walletId" | "currencyId">>,
  ): Promise<WalletBalance> {
    return this.findOne({
      where: filter,
    });
  }

  async updateWalletBalance(
    id: string,
    walletBalanceData: Partial<WalletBalance>,
  ) {
    await this.update({ id }, walletBalanceData);
    return this.findWalletBalance({ id });
  }
}
