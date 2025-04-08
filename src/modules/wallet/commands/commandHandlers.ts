import { FundWalletDto } from "../dto/fundWallet.dto";

export class FundWalletCommand {
  constructor(public readonly payload: FundWalletDto) {}
}
