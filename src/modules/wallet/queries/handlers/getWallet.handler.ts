import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { AppLogger } from "@shared/observability/logger";
import { GetWalletQuery } from "../queryHandlers";
import { WalletService } from "@modules/core/services/wallet.service";
import { Injectable } from "@nestjs/common";

@Injectable()
@QueryHandler(GetWalletQuery)
export class GetWalletHandler implements IQueryHandler<GetWalletQuery> {
  private readonly logger = new AppLogger(GetWalletHandler.name);

  constructor(private readonly walletService: WalletService) {}

  async execute(query: GetWalletQuery) {
    const { userId } = query;

    console.log(query);

    return this.walletService.getWalletByUserId(userId);
  }
}
