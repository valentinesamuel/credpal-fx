import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "@modules/core/entities/transaction.entity";
import { TransactionService } from "@modules/core/services/transaction.service";
import { TransactionRepository } from "@adapters/repositories/transaction.repository";
import { WalletModule } from "@modules/wallet/wallet.module";
import { TransactionController } from "./controller/transaction.controller";
import { GetAllTransactionsHandler } from "./queries/handlers/getWallet.handler";
import { CqrsModule } from "@nestjs/cqrs";
import { CoreModule } from "@modules/core/core.module";
import { AuthModule } from "@modules/auth/auth.module";
import { CacheModule } from "@adapters/cache/cache.module";

const CommandHandlers = [];

const QueryHandlers = [GetAllTransactionsHandler];

@Module({
  imports: [
    CoreModule,
    TypeOrmModule.forFeature([Transaction]),
    AuthModule,
    WalletModule,
    CqrsModule,
    CacheModule,
  ],
  providers: [
    TransactionService,
    TransactionRepository,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [TransactionService],
  controllers: [TransactionController],
})
export class TransactionModule {}
