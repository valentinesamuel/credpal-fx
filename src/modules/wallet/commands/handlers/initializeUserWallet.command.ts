import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InitializeUserWalletCommand } from "../commandHandlers";
import { AppLogger } from "@shared/observability/logger";
import { WalletService } from "@modules/core/services/wallet.service";
import { CurrencyService } from "@modules/core/services/currency.service";
import { TransactionService } from "@modules/core/services/transaction.service";
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "@modules/core/entities/transaction.entity";
import { UnitOfWork } from "@adapters/repositories/transactions/unitOfWork.trx";
import { WalletBalanceService } from "@modules/core/services/walletBalance.service";
import { FXRateAdapter } from "@adapters/fxRates/fxRate.adapter";
import { FXRateProviderEnum } from "@adapters/fxRates/fxRate.interface";

@Injectable()
@CommandHandler(InitializeUserWalletCommand)
export class InitializeUserWalletHandler
  implements ICommandHandler<InitializeUserWalletCommand>
{
  private readonly logger = new AppLogger(InitializeUserWalletHandler.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly currencyService: CurrencyService,
    private readonly transactionService: TransactionService,
    private readonly walletBalanceService: WalletBalanceService,
    private readonly fxRateAdapter: FXRateAdapter,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: InitializeUserWalletCommand) {
    const { user } = command;

    return this.unitOfWork.executeInTransaction(async () => {
      this.logger.log("Initializing user wallet in transaction");
      const initialDepositAmount = 120000;

      const currency = await this.currencyService.getCurrencyByData({
        countryId: user.countryId,
      });

      // get FX rate
      const fxRate = await this.fxRateAdapter.getFXRateForCurrencyPair(
        currency.code,
        currency.code,
        FXRateProviderEnum.EXCHANGE_RATE_API,
      );
      const currentConversionRate = fxRate.result.rate;

      // find user wallet, if ont exists, create new one
      let wallet = await this.walletService.getWalletByUserId(user.id);

      if (!wallet) {
        wallet = await this.walletService.createWallet({
          userId: user.id,
        });
      }

      const transaction = await this.transactionService.createTransaction({
        sourceWalletId: wallet.id,
        destinationWalletId: wallet.id,
        type: TransactionType.DEPOSIT,
        sourceCurrencyId: currency.id,
        destinationCurrencyId: currency.id,
        amount: initialDepositAmount,
        exchangeRate: currentConversionRate,
        status: TransactionStatus.PENDING,
        idempotencyKey: `${user.id}-${initialDepositAmount}-${currency.id}-${PaymentMethod.BONUS}`,
        paymentMethod: PaymentMethod.BONUS,
        referenceId: user.id,
        metadata: {
          userId: user.id,
          rateSource: "FX_API",
          preBalance: {
            source: 0,
          },
        },
        initializedAt: new Date().toISOString(),
      });

      let walletBalance =
        await this.walletBalanceService.getWalletBalanceByData({
          walletId: wallet.id,
          currencyId: currency.id,
        });

      if (!walletBalance) {
        walletBalance = await this.walletBalanceService.createWalletBalance({
          walletId: wallet.id,
          currencyId: currency.id,
          amount: initialDepositAmount,
          availableAmount: initialDepositAmount,
        });
      }

      await this.transactionService.updateTransaction(transaction.id, {
        status: TransactionStatus.COMPLETED,
        metadata: {
          ...transaction.metadata,
          postBalance: {
            source: initialDepositAmount,
          },
        },
        completedAt: new Date().toISOString(),
      });

      const updatedWallet = await this.walletService.getWalletByUserId(user.id);

      return updatedWallet;
    });
  }
}
