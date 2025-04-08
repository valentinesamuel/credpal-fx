import { User } from "@modules/core/entities/user.entity";
import { FundWalletDto } from "../dto/fundWallet.dto";

export class FundWalletCommand {
  constructor(
    public readonly payload: FundWalletDto,
    public readonly user: User,
  ) {}
}

export class InitializeUserWalletCommand {
  constructor(public readonly user: User) {}
}
