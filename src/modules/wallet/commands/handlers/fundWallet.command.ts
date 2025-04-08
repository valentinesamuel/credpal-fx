import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { FundWalletCommand } from "../commandHandlers";
import { AppLogger } from "@shared/observability/logger";
import { WalletService } from "@modules/core/services/wallet.service";
import { CurrencyService } from "@modules/core/services/currency.service";
import { UnitOfWork } from "@adapters/repositories/transactions/unitOfWork.trx";
import { TransactionService } from "@modules/core/services/transaction.service";
import {
  TransactionStatus,
  TransactionType,
} from "@modules/core/entities/transaction.entity";

@Injectable()
@CommandHandler(FundWalletCommand)
export class FundWalletHandler implements ICommandHandler<FundWalletCommand> {
  private readonly logger = new AppLogger(FundWalletHandler.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly currencyService: CurrencyService,
    private readonly unitOfWork: UnitOfWork,
    private readonly transactionService: TransactionService,
  ) {}

  async execute(command: FundWalletCommand) {
    const { payload, user } = command;

    return this.unitOfWork.executeInTransaction(async () => {
      // get the wallet by user id
      const wallet =
        await this.walletService.getWalletByUserIdAndFailIfNotExists(user.id);

      // get the currency by currency code
      const currency =
        await this.currencyService.getCurrencyByDataAndFailIfNotExists({
          code: payload.currency,
        });

      // create transaction
      const transaction = await this.transactionService.createTransaction({
        amount: payload.amount,
        sourceCurrencyId: currency.id,
        destinationCurrencyId: currency.id,
        sourceWalletId: wallet.id,
        destinationWalletId: wallet.id,
        type: TransactionType.DEPOSIT,
        exchangeRate: 1, // change this to the actual exchange rate from the API
        status: TransactionStatus.PENDING,
        referenceId: user.id,
        metadata: { userId: user.id },
        initializedAt: new Date().toISOString(),
      });

      // if there is a wallet balance for that currency, update it, else create a new wallet balance
      const walletBalance = await this.walletService.getWalletBalanceByData({
        walletId: wallet.id,
        currencyId: currency.id,
      });

      if (walletBalance) {
        await this.walletService.updateWalletBalance(walletBalance.id, {
          amount: walletBalance.amount + payload.amount,
          availableAmount: walletBalance.availableAmount + payload.amount,
        });
      } else {
        await this.walletService.createWalletBalance({
          walletId: wallet.id,
          currencyId: currency.id,
          amount: payload.amount,
          availableAmount: payload.amount,
        });
      }

      // update transaction
      await this.transactionService.updateTransaction(transaction.id, {
        status: TransactionStatus.COMPLETED,
        completedAt: new Date().toISOString(),
      });

      // return the wallet with balance
      const updatedWallet = await this.walletService.getWalletByUserId(user.id);

      return { wallet: updatedWallet };
    });
  }
}
