import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Currency } from "./currency.entity";
import { User } from "./user.entity";

@Entity()
export class Country extends BaseEntity {
  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  phoneCode: string;

  @Column({ type: "varchar" })
  isoAlphaTwoCode: string;

  @Column({ type: "varchar" })
  isoAlphaThreeCode: string;

  @Column({ type: "varchar" })
  subdivisionLink: string;

  @OneToMany(() => Currency, (currency) => currency.country)
  currencies: Currency[];

  @OneToMany(() => User, (user) => user.country)
  users: User[];
}
