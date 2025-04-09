import { BadRequestException, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { TradeCommand } from "../commandHandlers";
import { AppLogger } from "@shared/observability/logger";
import { WalletService } from "@modules/core/services/wallet.service";
import { CurrencyService } from "@modules/core/services/currency.service";
import { UnitOfWork } from "@adapters/repositories/transactions/unitOfWork.trx";
import { TransactionService } from "@modules/core/services/transaction.service";
import {
  PaymentMethod,
  TransactionStatus,
  TransactionType,
} from "@modules/core/entities/transaction.entity";
import { WalletBalanceService } from "@modules/core/services/walletBalance.service";
import { FXRateAdapter } from "@adapters/fxRates/fxRate.adapter";
import { FXRateProviderEnum } from "@adapters/fxRates/fxRate.interface";

@Injectable()
@CommandHandler(TradeCommand)
export class TradeHandler implements ICommandHandler<TradeCommand> {
  private readonly logger = new AppLogger(TradeHandler.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly currencyService: CurrencyService,
    private readonly unitOfWork: UnitOfWork,
    private readonly transactionService: TransactionService,
    private readonly walletBalanceService: WalletBalanceService,
    private readonly fxRateAdapter: FXRateAdapter,
  ) {}

  async execute(command: TradeCommand) {
    const { payload, user } = command;

    return this.unitOfWork.executeInTransaction(async () => {
      // Validate amount
      if (payload.amount <= 0) {
        throw new BadRequestException("Trade amount must be greater than zero");
      }

      // Get wallet with lock for atomicity
      const wallet =
        await this.walletService.getWalletByUserIdAndFailIfNotExists(user.id);

      // Get currencies
      const [sourceCurrency, targetCurrency] = await Promise.all([
        this.currencyService.getCurrencyByDataAndFailIfNotExists({
          code: payload.sourceCurrency,
        }),
        this.currencyService.getCurrencyByDataAndFailIfNotExists({
          code: payload.targetCurrency,
        }),
      ]);

      // Validate currencies
      if (sourceCurrency.id === targetCurrency.id) {
        throw new BadRequestException(
          "Cannot trade between identical currencies",
        );
      }

      // Get FX rate for the currency pair
      const fxRate = await this.fxRateAdapter.getFXRateForCurrencyPair(
        sourceCurrency.code,
        targetCurrency.code,
        FXRateProviderEnum.ALPHAVANTAGE,
      );

      const currentRate = fxRate.result.rate;
      const targetAmount = payload.amount * currentRate;

      // Get or create balances with lock
      let [sourceBalance, targetBalance] = await Promise.all([
        this.walletBalanceService.getWalletBalanceByData({
          walletId: wallet.id,
          currencyId: sourceCurrency.id,
        }),
        this.walletBalanceService.getWalletBalanceByData({
          walletId: wallet.id,
          currencyId: targetCurrency.id,
        }),
      ]);

      // Create source balance if it doesn't exist
      if (!sourceBalance) {
        await this.walletBalanceService.createWalletBalance({
          walletId: wallet.id,
          currencyId: sourceCurrency.id,
          amount: 0,
          availableAmount: 0,
        });
        sourceBalance = await this.walletBalanceService.getWalletBalanceByData({
          walletId: wallet.id,
          currencyId: sourceCurrency.id,
        });
      }

      // Create target balance if it doesn't exist
      if (!targetBalance) {
        await this.walletBalanceService.createWalletBalance({
          walletId: wallet.id,
          currencyId: targetCurrency.id,
          amount: 0,
          availableAmount: 0,
        });
        targetBalance = await this.walletBalanceService.getWalletBalanceByData({
          walletId: wallet.id,
          currencyId: targetCurrency.id,
        });
      }

      // Prevent double spending by checking available balance
      if (sourceBalance.availableAmount < payload.amount) {
        throw new BadRequestException(
          `Insufficient ${sourceCurrency.code} balance for trade`,
        );
      }

      // Create transaction to record the trade
      const transaction = await this.transactionService.createTransaction({
        amount: payload.amount,
        sourceCurrencyId: sourceCurrency.id,
        destinationCurrencyId: targetCurrency.id,
        sourceWalletId: wallet.id,
        destinationWalletId: wallet.id,
        type: TransactionType.TRADE,
        paymentMethod: PaymentMethod.WALLET,
        referenceId: user.id,
        exchangeRate: currentRate,
        status: TransactionStatus.PENDING,
        idempotencyKey: `TRADE-${user.id}-${payload.amount}-${payload.sourceCurrency}-${payload.targetCurrency}-${Date.now()}`,
        metadata: {
          userId: user.id,
          rateSource: "FX_API",
          tradeType: "SPOT",
          preBalance: {
            source: sourceBalance.availableAmount,
            destination: targetBalance.availableAmount,
          },
        },
        initializedAt: new Date().toISOString(),
      });

      const sourceAmount = sourceBalance.amount - payload.amount;
      const sourceAvailableAmount =
        sourceBalance.availableAmount - payload.amount;

      const targetAmountt = targetBalance.amount + payload.amount;
      const targetAvailableAmount =
        targetBalance.availableAmount + targetAmountt;

      // Update balances atomically
      await Promise.all([
        // Decrease source balance
        this.walletBalanceService.updateWalletBalance(sourceBalance.id, {
          amount: sourceAmount,
          availableAmount: sourceAvailableAmount,
        }),
        // Increase target balance
        this.walletBalanceService.updateWalletBalance(targetBalance.id, {
          amount: targetAmountt,
          availableAmount: targetAvailableAmount,
        }),
      ]);

      // Complete transaction
      await this.transactionService.updateTransaction(transaction.id, {
        status: TransactionStatus.COMPLETED,
        completedAt: new Date().toISOString(),
        metadata: {
          ...transaction.metadata,
          postBalance: {
            source: sourceBalance.availableAmount,
            destination: targetBalance.availableAmount,
          },
        },
      });

      return {
        transactionId: transaction.id,
        sourceCurrency: sourceCurrency.code,
        targetCurrency: targetCurrency.code,
        sourceAmount: payload.amount,
        targetAmount: targetAmount,
        rate: currentRate,
        timestamp: new Date().toISOString(),
      };
    });
  }
}
