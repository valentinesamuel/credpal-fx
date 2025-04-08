import { WalletRepository } from "@adapters/repositories/wallet.repository";
import { ConflictException, Injectable } from "@nestjs/common";
import { AppLogger } from "@shared/observability/logger";
import { Wallet } from "../entities/wallet.entity";
import { WalletBalance } from "../entities/walletBalance.entity";
import { EntityManager } from "typeorm";

@Injectable()
export class WalletService {
  private readonly logger = new AppLogger(WalletService.name);

  constructor(private readonly walletRepository: WalletRepository) {}

  async getWalletByUserId(userId: string, entityManager?: EntityManager) {
    return this.walletRepository.findWallet({ userId }, entityManager);
  }

  async createWallet(
    walletData: Partial<Wallet>,
    entityManager?: EntityManager,
  ): Promise<Wallet> {
    return this.walletRepository.createWallet(walletData, entityManager);
  }

  async findWalletByUserIdAndFailIfExists(
    userId: string,
    entityManager?: EntityManager,
  ) {
    const wallet = await this.walletRepository.findWallet(
      { userId },
      entityManager,
    );
    if (wallet) {
      throw new ConflictException(
        `Wallet already exists for user id: ${userId}`,
      );
    }
    return wallet;
  }

  async createWalletBalance(
    walletBalanceData: Partial<WalletBalance>,
    entityManager?: EntityManager,
  ): Promise<WalletBalance> {
    return this.walletRepository.createWalletBalance(
      walletBalanceData,
      entityManager,
    );
  }

  async updateWallet(
    id: string,
    walletData: Partial<Wallet>,
    entityManager?: EntityManager,
  ): Promise<Wallet> {
    return this.walletRepository.updateWallet(id, walletData, entityManager);
  }

  async getWalletAndFailIfNotExists(id: string, entityManager?: EntityManager) {
    const wallet = await this.walletRepository.findWallet(
      { id },
      entityManager,
    );
    if (!wallet) {
      throw new Error(`Wallet not found for id: ${id}`);
    }
    return wallet;
  }
}
