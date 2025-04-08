import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Wallet } from "./wallet.entity";
import { Currency } from "./currency.entity";

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
  TRANSFER = "TRANSFER",
  PAYMENT = "PAYMENT",
  REFUND = "REFUND",
  CHARGEBACK = "CHARGEBACK",
  FEE = "FEE",
  INTEREST = "INTEREST",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
  CHARGEBACK = "CHARGEBACK",
}

@Entity()
export class Transaction extends BaseEntity {
  @Index()
  @Column({ type: "varchar" })
  sourceWalletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.sourceTransactions)
  @JoinColumn({ name: "sourceWalletId" })
  sourceWallet: Wallet;

  @Index()
  @Column({ type: "varchar" })
  destinationWalletId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.destinationTransactions)
  @JoinColumn({ name: "destinationWalletId" })
  destinationWallet: Wallet;

  @Column({ type: "varchar" })
  type: TransactionType;

  @Column({ type: "varchar" })
  sourceCurrencyId: string;

  @ManyToOne(() => Currency, (currency) => currency.sourceTransactions)
  @JoinColumn({ name: "sourceCurrencyId" })
  sourceCurrency: Currency;

  @Column({ type: "varchar" })
  destinationCurrencyId: string;

  @ManyToOne(() => Currency, (currency) => currency.destinationTransactions)
  @JoinColumn({ name: "destinationCurrencyId" })
  destinationCurrency: Currency;

  @Column({ type: "integer" })
  amount: number;

  @Column({ type: "decimal" })
  exchangeRate: number;

  @Column({ type: "varchar" })
  status: TransactionStatus;

  @Column({ type: "varchar" })
  referenceId: string;

  @Column({ type: "json" })
  metadata: Record<string, any>;

  @Column({ type: "timestamp with time zone" })
  initializedAt: string;

  @Column({ type: "timestamp with time zone", nullable: true })
  completedAt: string;
}
