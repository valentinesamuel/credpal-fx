import { WalletRepository } from "@adapters/repositories/wallet.repository";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AppLogger } from "@shared/observability/logger";
import { Wallet } from "../entities/wallet.entity";
import { WalletBalance } from "../entities/walletBalance.entity";

@Injectable()
export class WalletService {
  private readonly logger = new AppLogger(WalletService.name);

  constructor(private readonly walletRepository: WalletRepository) {}

  async getWalletByUserId(userId: string) {
    return this.walletRepository.findWallet({ userId });
  }

  async getWalletBalanceByData(walletBalanceData: Partial<WalletBalance>) {
    return this.walletRepository.findWalletBalance(walletBalanceData);
  }

  async createWallet(walletData: Partial<Wallet>): Promise<Wallet> {
    return this.walletRepository.createWallet(walletData);
  }

  async createWalletBalance(
    walletBalanceData: Partial<WalletBalance>,
  ): Promise<WalletBalance> {
    return this.walletRepository.createWalletBalance(walletBalanceData);
  }

  async updateWallet(id: string, walletData: Partial<Wallet>): Promise<Wallet> {
    return this.walletRepository.updateWallet(id, walletData);
  }

  async updateWalletBalance(
    id: string,
    walletBalanceData: Partial<WalletBalance>,
  ): Promise<WalletBalance> {
    return this.walletRepository.updateWalletBalance(id, walletBalanceData);
  }

  async getWalletByUserIdAndFailIfNotExists(userId: string) {
    const wallet = await this.walletRepository.findWallet({ userId });
    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user: ${userId}`);
    }
    return wallet;
  }

  async findWalletBalanceAndFailIfExists(id: string) {
    const walletBalance = await this.walletRepository.findWalletBalance({ id });
    if (walletBalance) {
      throw new NotFoundException(`Wallet balance not found for id: ${id}`);
    }
  }
}
