import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Wallet } from "./wallet.entity";

export enum WalletCurrency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  AUD = "AUD",
}

@Entity()
export class WalletBalance extends BaseEntity {
  @Column({ type: "varchar" })
  walletId: string;

  @Column({ type: "varchar" })
  currency: WalletCurrency;

  @Column({ type: "integer" })
  amount: number;

  @Column({ type: "integer" })
  availableAmount: number;

  @OneToOne(() => Wallet)
  @JoinColumn({ name: "wallet_id" })
  wallet: Wallet;
}
