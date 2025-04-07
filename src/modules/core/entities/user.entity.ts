import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Unique,
} from "typeorm";
import { Wallet } from "./wallet.entity";
import { Country } from "./country.entity";
import { Role } from "./role.entity";

@Unique(["email", "firstName", "lastName"])
@Entity()
export class User extends BaseEntity {
  @Column({ type: "varchar" })
  firstName: string;

  @Column({ type: "varchar" })
  lastName: string;

  @Column({ type: "varchar" })
  countryId: string;

  @Index()
  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "varchar" })
  password: string;

  @Column({ type: "varchar" })
  phoneNumber: string;

  @Column({ type: "boolean", default: false })
  isVerified: boolean;

  @Column({ type: "varchar", nullable: true })
  role_id: string;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet: Wallet;

  @ManyToOne(() => Country, (country) => country.users)
  country: Country;

  @OneToOne(() => Role, (role) => role.user)
  @JoinColumn({ name: "role_id" })
  role: Role;
}
