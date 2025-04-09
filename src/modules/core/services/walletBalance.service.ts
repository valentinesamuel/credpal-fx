import { WalletRepository } from "@adapters/repositories/wallet.repository";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AppLogger } from "@shared/observability/logger";
import { WalletBalance } from "../entities/walletBalance.entity";
import { WalletBalanceRepository } from "@adapters/repositories/walletBalance.repository";

@Injectable()
export class WalletBalanceService {
  private readonly logger = new AppLogger(WalletBalanceService.name);

  constructor(
    private readonly walletBalanceRepository: WalletBalanceRepository,
  ) {}

  async getWalletBalanceByData(walletBalanceData: Partial<WalletBalance>) {
    return this.walletBalanceRepository.findWalletBalance(walletBalanceData);
  }

  async getWalletBalanceByDataAndFailIfNotExists(
    walletBalanceData: Partial<WalletBalance>,
  ) {
    const walletBalance =
      await this.walletBalanceRepository.findWalletBalance(walletBalanceData);
    if (!walletBalance) {
      throw new NotFoundException(
        `${walletBalanceData.currency.name} wallet balance not found`,
      );
    }
    return walletBalance;
  }

  async createWalletBalance(
    walletBalanceData: Partial<WalletBalance>,
  ): Promise<WalletBalance> {
    return this.walletBalanceRepository.createWalletBalance(walletBalanceData);
  }

  async updateWalletBalance(
    id: string,
    walletBalanceData: Partial<WalletBalance>,
  ): Promise<WalletBalance> {
    return this.walletBalanceRepository.updateWalletBalance(
      id,
      walletBalanceData,
    );
  }
}
