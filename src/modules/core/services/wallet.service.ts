import { WalletRepository } from "@adapters/repositories/wallet.repository";
import { Injectable } from "@nestjs/common";
import { AppLogger } from "@shared/observability/logger";
import { Wallet } from "../entities/wallet.entity";

@Injectable()
export class WalletService {
  private readonly logger = new AppLogger(WalletService.name);

  constructor(private readonly walletRepository: WalletRepository) {}

  async getWalletByUserId(userId: string) {
    return this.walletRepository.findWallet({ userId });
  }

  async createWallet(walletData: Partial<Wallet>): Promise<Wallet> {
    return this.walletRepository.createWallet(walletData);
  }

  async updateWallet(id: string, walletData: Partial<Wallet>): Promise<Wallet> {
    return this.walletRepository.updateWallet(id, walletData);
  }

  async getWalletAndFailIfNotExists(id: string) {
    const wallet = await this.walletRepository.findWallet({ id });
    if (!wallet) {
      throw new Error(`Wallet not found for id: ${id}`);
    }
    return wallet;
  }
}
