import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, Index, OneToMany, Unique } from "typeorm";
import { Wallet } from "./wallet.entity";

@Unique(["email", "firstName", "lastName"])
@Entity()
export class User extends BaseEntity {
  @Column({ type: "varchar" })
  firstName: string;

  @Column({ type: "varchar" })
  lastName: string;

  @Index()
  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ type: "boolean" })
  isVerified: boolean;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];
}
