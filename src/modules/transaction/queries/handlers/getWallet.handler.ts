import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppLogger } from "@shared/observability/logger";
import { GetAllTransactionsQuery } from "../queryHandlers";
import { WalletService } from "@modules/core/services/wallet.service";
import { Injectable } from "@nestjs/common";
import { TransactionService } from "@modules/core/services/transaction.service";

@Injectable()
@QueryHandler(GetAllTransactionsQuery)
export class GetAllTransactionsHandler
  implements IQueryHandler<GetAllTransactionsQuery>
{
  private readonly logger = new AppLogger(GetAllTransactionsHandler.name);

  constructor(
    private readonly transactionService: TransactionService,
    private readonly walletService: WalletService,
  ) {}

  async execute(query: GetAllTransactionsQuery) {
    const { userId } = query;

    const wallet =
      await this.walletService.getWalletByUserIdAndFailIfNotExists(userId);

    return this.transactionService.getAllTransactionsByWalletId(wallet.id);
  }
}
