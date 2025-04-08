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
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@adapters/cache/cache.module";
import { AuthModule } from "@modules/auth/auth.module";
import { WalletBalance } from "@modules/core/entities/walletBalance.entity";
import { CurrencyModule } from "@modules/currency/currency.module";
import { InitializeUserWalletHandler } from "./commands/handlers/initializeUserWallet.command";
import { TransactionModule } from "@modules/transaction/transaction.module";

// Define all command handlers
const CommandHandlers = [FundWalletHandler, InitializeUserWalletHandler];

const QueryHandlers = [GetWalletHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, WalletBalance]),
    ConfigModule.forRoot(),
    CoreModule,
    CacheModule,
    CqrsModule,
    AuthModule,
    CurrencyModule,
    TransactionModule,
  ],
  providers: [
    // Services
    WalletService,

    // Repositories
    WalletRepository,

    // Handlers
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  controllers: [WalletController],
})
export class WalletModule {}
