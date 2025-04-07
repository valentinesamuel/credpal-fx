import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Otp extends BaseEntity {
  @Column({ type: "varchar" })
  pinId: string;

  @Column({ type: "time with time zone" })
  expiresAt: Date;

  @Column({ type: "boolean" })
  isActive: boolean;

  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "varchar" })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;
}
