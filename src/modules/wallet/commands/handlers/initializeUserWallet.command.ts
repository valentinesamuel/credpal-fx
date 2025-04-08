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
import { RoleRepository } from "@adapters/repositories/role.repository";
import { UserService } from "@modules/core/services/user.service";

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

      const wallet = await this.walletService.createWallet({
        userId: user.id,
      });

      const transaction = await this.transactionService.createTransaction({
        sourceWalletId: wallet.id,
        destinationWalletId: wallet.id,
        type: TransactionType.DEPOSIT,
        sourceCurrencyId: currency.id,
        destinationCurrencyId: currency.id,
        amount: initialDepositAmount,
        exchangeRate: 1, // TODO: Add exchange rate from FX API
        status: TransactionStatus.PENDING,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        referenceId: user.id,
        metadata: { userId: user.id },
        initializedAt: new Date().toISOString(),
      });

      await this.walletService.createWalletBalance({
        walletId: wallet.id,
        currencyId: currency.id,
        amount: initialDepositAmount,
        availableAmount: initialDepositAmount,
      });

      await this.transactionService.updateTransaction(transaction.id, {
        status: TransactionStatus.COMPLETED,
        completedAt: new Date().toISOString(),
      });

      const updatedWallet = await this.walletService.getWalletByUserId(user.id);

      return updatedWallet;
    });
  }
}
