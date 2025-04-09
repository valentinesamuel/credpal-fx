import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Wallet } from "./wallet.entity";
import { Currency } from "./currency.entity";

@Entity()
export class WalletBalance extends BaseEntity {
  @Column({ type: "varchar" })
  walletId: string;

  @Column({ type: "varchar" })
  currencyId: string;

  @ManyToOne(() => Currency)
  currency: Currency;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  availableAmount: number;

  @ManyToOne(() => Wallet)
  @JoinColumn({ name: "wallet_id" })
  wallet: Wallet;
}
