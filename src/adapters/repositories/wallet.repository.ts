import { Injectable, Logger } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Wallet } from "@modules/core/entities/wallet.entity";

@Injectable()
export class WalletRepository extends Repository<Wallet> {
  private readonly logger = new Logger(WalletRepository.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly entityManager: EntityManager,
  ) {
    super(
      walletRepository.target,
      walletRepository.manager,
      walletRepository.queryRunner,
    );
  }

  async createWallet(walletData: Partial<Wallet>): Promise<Wallet> {
    const wallet = this.create(walletData);
    return this.save(wallet);
  }

  async findWallet(
    filter: Partial<Pick<Wallet, "id" | "userId">>,
  ): Promise<Wallet> {
    return this.findOne({
      where: [{ id: filter.id }, { userId: filter.userId }],
    });
  }

  async updateWallet(id: string, walletData: Partial<Wallet>): Promise<Wallet> {
    await this.update({ id }, walletData);
    return this.findWallet({
      id,
    });
  }
}
