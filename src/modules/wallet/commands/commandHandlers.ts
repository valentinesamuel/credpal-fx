import { User } from "@modules/core/entities/user.entity";
import { FundWalletDto } from "../dto/fundWallet.dto";

export class FundWalletCommand {
  constructor(public readonly payload: FundWalletDto) {}
}

export class InitializeUserWalletCommand {
  constructor(public readonly user: User) {}
}
