import { User } from "@modules/core/entities/user.entity";
import { FundWalletDto } from "../dto/fundWallet.dto";
import { ConvertCurrencyDto } from "../dto/convertCurrency.dto";

export class FundWalletCommand {
  constructor(
    public readonly payload: FundWalletDto,
    public readonly user: User,
  ) {}
}

export class InitializeUserWalletCommand {
  constructor(public readonly user: User) {}
}

export class ConvertCurrencyCommand {
  constructor(
    public readonly payload: ConvertCurrencyDto,
    public readonly user: User,
  ) {}
}
