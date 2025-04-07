import { Entity, ManyToOne, JoinColumn } from "typeorm";
import { Permission } from "./permission.entity";
import { Role } from "./role.entity";
import { BaseEntity } from "@shared/repositoryHelpers/base.entity";

@Entity()
export class RolePermission extends BaseEntity {
  @ManyToOne(() => Role, (role) => role.rolePermissions)
  @JoinColumn({ name: "role_id" })
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  @JoinColumn({ name: "permission_id" })
  permission: Permission;
}
