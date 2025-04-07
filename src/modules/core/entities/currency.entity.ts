import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Country } from "./country.entity";
import { Transaction } from "./transaction.entity";

@Entity()
export class Currency extends BaseEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  code: string;

  @Column({ type: "varchar" })
  countryId: string;

  @ManyToOne(() => Country, (country) => country.currencies, {
    onUpdate: "CASCADE",
  })
  country: Country;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  rate: number;

  @Column({ type: "varchar" })
  symbol: string;

  @OneToMany(() => Transaction, (transaction) => transaction.sourceCurrency)
  sourceTransactions: Transaction[];

  @OneToMany(
    () => Transaction,
    (transaction) => transaction.destinationCurrency,
  )
  destinationTransactions: Transaction[];
}
