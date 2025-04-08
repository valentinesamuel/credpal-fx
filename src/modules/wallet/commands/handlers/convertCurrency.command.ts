import { BadRequestException, Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ConvertCurrencyCommand } from "../commandHandlers";
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

@Injectable()
@CommandHandler(ConvertCurrencyCommand)
export class ConvertCurrencyHandler
  implements ICommandHandler<ConvertCurrencyCommand>
{
  private readonly logger = new AppLogger(ConvertCurrencyHandler.name);

  constructor(
    private readonly walletService: WalletService,
    private readonly walletBalanceService: WalletBalanceService,
    private readonly currencyService: CurrencyService,
    private readonly unitOfWork: UnitOfWork,
    private readonly transactionService: TransactionService,
  ) {}

  async execute(command: ConvertCurrencyCommand) {
    const { payload, user } = command;

    return this.unitOfWork.executeInTransaction(async () => {
      // Validate amount
      if (payload.amount <= 0) throw new BadRequestException("Invalid amount");

      // Get wallet with lock
      const wallet =
        await this.walletService.getWalletByUserIdAndFailIfNotExists(user.id);

      // Get currencies
      const [sourceCurrency, destinationCurrency] = await Promise.all([
        this.currencyService.getCurrencyByDataAndFailIfNotExists({
          code: payload.sourceCurrency,
        }),
        this.currencyService.getCurrencyByDataAndFailIfNotExists({
          code: payload.targetCurrency,
        }),
      ]);

      // Validate currencies
      if (sourceCurrency.id === destinationCurrency.id) {
        throw new BadRequestException("Identical currencies");
      }

      // Get FX rate
      const currentConversionRate = 1200.33; // TODO: Get the current conversion rate from FX API

      // Get balances with lock , if not available, create a new balance
      let [sourceBalance, destinationBalance] = await Promise.all([
        this.walletBalanceService.getWalletBalanceByData({
          walletId: wallet.id,
          currencyId: sourceCurrency.id,
        }),
        this.walletBalanceService.getWalletBalanceByData({
          walletId: wallet.id,
          currencyId: destinationCurrency.id,
        }),
      ]);

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

      if (!destinationBalance) {
        destinationBalance =
          await this.walletBalanceService.createWalletBalance({
            walletId: wallet.id,
            currencyId: destinationCurrency.id,
            amount: 0,
            availableAmount: 0,
          });
        destinationBalance =
          await this.walletBalanceService.getWalletBalanceByData({
            walletId: wallet.id,
            currencyId: destinationCurrency.id,
          });
      }

      // Validate balances
      if (sourceBalance.availableAmount < payload.amount) {
        throw new BadRequestException("Insufficient balance");
      }

      // Create transaction
      const transaction = await this.transactionService.createTransaction({
        amount: payload.amount,
        sourceCurrencyId: sourceCurrency.id,
        destinationCurrencyId: destinationCurrency.id,
        sourceWalletId: wallet.id,
        destinationWalletId: wallet.id,
        type: TransactionType.CONVERSION,
        paymentMethod: PaymentMethod.WALLET,
        referenceId: user.id,
        exchangeRate: currentConversionRate,
        status: TransactionStatus.PENDING,
        metadata: {
          userId: user.id,
          rateSource: "FX_API",
          preBalance: {
            source: sourceBalance.availableAmount,
            destination: destinationBalance.availableAmount,
          },
        },
        initializedAt: new Date().toISOString(),
      });

      // Update balances
      await Promise.all([
        this.walletBalanceService.updateWalletBalance(sourceBalance.id, {
          amount: sourceBalance.amount - payload.amount,
          availableAmount: sourceBalance.availableAmount - payload.amount,
        }),
        this.walletBalanceService.updateWalletBalance(destinationBalance.id, {
          amount: destinationBalance.amount + payload.amount,
          availableAmount: destinationBalance.availableAmount + payload.amount,
        }),
      ]);

      // Finalize transaction
      await this.transactionService.updateTransaction(transaction.id, {
        status: TransactionStatus.COMPLETED,
        metadata: {
          ...transaction.metadata,
          postBalance: {
            source: sourceBalance.availableAmount - payload.amount,
            destination: destinationBalance.availableAmount + payload.amount,
          },
        },
        completedAt: new Date().toISOString(),
      });

      return { success: true };
    });
  }
}
