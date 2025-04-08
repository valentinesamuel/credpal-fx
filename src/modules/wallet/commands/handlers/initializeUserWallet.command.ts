import { Injectable } from "@nestjs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { InitializeUserWalletCommand } from "../commandHandlers";
import { AppLogger } from "@shared/observability/logger";
import { EntityManager } from "typeorm";
import { InjectEntityManager } from "@nestjs/typeorm";
import { WalletService } from "@modules/core/services/wallet.service";
import { CurrencyService } from "@modules/core/services/currency.service";
import { TransactionService } from "@modules/core/services/transaction.service";
import {
  TransactionStatus,
  TransactionType,
} from "@modules/core/entities/transaction.entity";

@Injectable()
@CommandHandler(InitializeUserWalletCommand)
export class InitializeUserWalletHandler
  implements ICommandHandler<InitializeUserWalletCommand>
{
  private readonly logger = new AppLogger(InitializeUserWalletHandler.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly walletService: WalletService,
    private readonly currencyService: CurrencyService,
    private readonly transactionService: TransactionService,
  ) {}

  async execute(command: InitializeUserWalletCommand) {
    const { user } = command;

    return this.entityManager.transaction(async (transactionEntityManager) => {
      try {
        this.logger.log("Initializing user wallet in transaction");
        const initialDepositAmount = 120000;

        const currency = await this.currencyService.getCurrencyByData(
          { countryId: user.countryId },
          transactionEntityManager,
        );

        await this.walletService.findWalletByUserIdAndFailIfExists(
          user.id,
          transactionEntityManager,
        );

        const wallet = await this.walletService.createWallet(
          { userId: user.id },
          transactionEntityManager,
        );

        const transaction = await this.transactionService.createTransaction(
          {
            sourceWalletId: wallet.id,
            destinationWalletId: wallet.id,
            type: TransactionType.DEPOSIT,
            sourceCurrencyId: currency.id,
            destinationCurrencyId: currency.id,
            amount: initialDepositAmount,
            exchangeRate: 1,
            status: TransactionStatus.PENDING,
            referenceId: user.id,
            metadata: { userId: user.id },
            initializedAt: new Date().toISOString(),
          },
          transactionEntityManager,
        );

        await this.walletService.createWalletBalance(
          {
            walletId: wallet.id,
            currencyId: currency.id,
            amount: initialDepositAmount,
            availableAmount: initialDepositAmount,
          },
          transactionEntityManager,
        );

        // Mark the transaction as complete
        await this.transactionService.updateTransaction(
          transaction.id,
          {
            status: TransactionStatus.COMPLETED,
            completedAt: new Date().toISOString(),
          },
          transactionEntityManager,
        );

        return { message: "User wallet initialized successfully" };
      } catch (error) {
        this.logger.error(
          `Failed to initialize user wallet: ${error.message}`,
          error.stack,
        );
        // The transaction will be automatically rolled back when an error is thrown
        throw error;
      }
    });
  }
}
