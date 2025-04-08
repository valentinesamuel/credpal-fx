import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FundWalletCommand } from "../commandHandlers";
import { AppLogger } from "@shared/observability/logger";
import { WalletService } from "@modules/core/services/wallet.service";
import { CurrencyService } from "@modules/core/services/currency.service";
import { UnitOfWork } from "@adapters/repositories/transactions/unitOfWork.trx";

@Injectable()
@CommandHandler(FundWalletCommand)
export class FundWalletHandler implements ICommandHandler<FundWalletCommand> {
  private readonly logger = new AppLogger(FundWalletHandler.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly currencyService: CurrencyService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: FundWalletCommand) {
    const { payload, user } = command;

    // get the wallet by user id
    const wallet = await this.walletService.getWalletAndFailIfNotExists(
      user.id,
    );

    // get the currency by currency code
    const currency = await this.currencyService.getCurrencyByData({
      code: payload.currency,
    });
    // create transaction
    // if there is a wallet balance for that currency, update it, else create a new wallet balance
    // update transaction
    // return success message

    return { payload, user };
  }
}
