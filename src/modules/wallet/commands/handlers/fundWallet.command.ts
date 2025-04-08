import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FundWalletCommand } from "../commandHandlers";
import { AppLogger } from "@shared/observability/logger";
import { EntityManager } from "typeorm";
import { InjectEntityManager } from "@nestjs/typeorm";
import { WalletService } from "@modules/core/services/wallet.service";

@Injectable()
@CommandHandler(FundWalletCommand)
export class FundWalletHandler implements ICommandHandler<FundWalletCommand> {
  private readonly logger = new AppLogger(FundWalletHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly walletService: WalletService,
  ) {}

  async execute(command: FundWalletCommand) {
    const { payload } = command;

    return payload;
  }
}
