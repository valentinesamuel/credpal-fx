import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { User } from "./user.entity";
import { RolePermission } from "./rolePermission.entity";

@Entity()
export class Role extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  user: User[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];
}
