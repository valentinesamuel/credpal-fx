import { Module } from "@nestjs/common";
import { WalletController } from "./controller/wallet.controller";
import { CqrsModule } from "@nestjs/cqrs";
import { WalletService } from "@modules/core/services/wallet.service";
import { WalletRepository } from "@adapters/repositories/wallet.repository";
import { GetWalletHandler } from "./queries/handlers/getWallet.handler";
import { FundWalletHandler } from "./commands/handlers/fundWallet.command";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Wallet } from "@modules/core/entities/wallet.entity";
import { CoreModule } from "@modules/core/core.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheModule } from "@adapters/cache/cache.module";
import { AuthModule } from "@modules/auth/auth.module";
import { WalletBalance } from "@modules/core/entities/walletBalance.entity";
import { CurrencyModule } from "@modules/currency/currency.module";
import { InitializeUserWalletHandler } from "./commands/handlers/initializeUserWallet.command";
import { ConvertCurrencyHandler } from "./commands/handlers/convertCurrency.command";
import { WalletBalanceService } from "@modules/core/services/walletBalance.service";
import { WalletBalanceRepository } from "@adapters/repositories/walletBalance.repository";
import { TransactionService } from "@modules/core/services/transaction.service";
import { TransactionRepository } from "@adapters/repositories/transaction.repository";
import { Transaction } from "@modules/core/entities/transaction.entity";
import { FXRateModule } from "@modules/trade/fxRate.module";

// Define all command handlers
const CommandHandlers = [
  FundWalletHandler,
  InitializeUserWalletHandler,
  ConvertCurrencyHandler,
];

const QueryHandlers = [GetWalletHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletBalance, Transaction]),
    ConfigModule.forRoot(),
    CoreModule,
    CacheModule,
    CqrsModule,
    AuthModule,
    CurrencyModule,
    FXRateModule,
  ],
  providers: [
    // Services
    WalletService,
    WalletBalanceService,
    TransactionService,

    // Repositories
    WalletRepository,
    WalletBalanceRepository,
    TransactionRepository,

    // Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  controllers: [WalletController],
  exports: [WalletService, WalletRepository],
})
export class WalletModule {}
