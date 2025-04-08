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
    const { payload, user } = command;

    // get the wallet by user id
    const wallet = await this.walletService.findWalletByUserIdAndFailIfExists(
      user.id,
      this.entityManager,
    );
    // get the currency by currency code
    // create transaction
    // if there is a wallet balance for that currency, update it, else create a new wallet balance
    // update transaction
    // return success message

    return { payload, user };
  }
}
