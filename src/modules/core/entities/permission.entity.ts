import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, ManyToMany, OneToMany } from "typeorm";
import { Role } from "./role.entity";
import { RolePermission } from "./rolePermission.entity";

@Entity()
export class Permission extends BaseEntity {
  @Column({ unique: true, type: "varchar" })
  action: string;

  @Column({ nullable: true, type: "varchar" })
  description: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];
}
