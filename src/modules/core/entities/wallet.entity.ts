import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./user.entity";
import { Transaction } from "./transaction.entity";
import { WalletBalance } from "./walletBalance.entity";

export enum WalletStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  CLOSED = "CLOSED",
}

@Entity()
export class Wallet extends BaseEntity {
  @Index()
  @Column({ type: "varchar" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "varchar", default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @OneToMany(() => Transaction, (transaction) => transaction.sourceWallet)
  sourceTransactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.destinationWallet)
  destinationTransactions: Transaction[];

  @OneToMany(() => WalletBalance, (balance) => balance.wallet)
  balances: WalletBalance[];
}
