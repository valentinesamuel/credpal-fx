import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, Index, OneToOne, Unique } from "typeorm";
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

  @Column({ type: "boolean", default: false })
  isVerified: boolean;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;
}
