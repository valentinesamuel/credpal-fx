import { Entity, ManyToOne, JoinColumn, Column } from "typeorm";
import { Permission } from "./permission.entity";
import { Role } from "./role.entity";
import { BaseEntity } from "@shared/repositoryHelpers/base.entity";

@Entity()
export class RolePermission extends BaseEntity {
  @Column({ type: "varchar" })
  roleId: string;

  @ManyToOne(() => Role, (role) => role.rolePermissions)
  @JoinColumn({ name: "role_id" })
  role: Role;

  @Column({ type: "varchar" })
  permissionId: string;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  @JoinColumn({ name: "permission_id" })
  permission: Permission;
}
