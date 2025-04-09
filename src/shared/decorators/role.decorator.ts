import { SetMetadata } from "@nestjs/common";

export type RoleOperation = "ANY" | "ALL";

export interface RoleRequirement {
  roles: string[];
  operation: RoleOperation;
}

export interface RoleValidationResult {
  isValid: boolean;
  missingRoles: string[];
}

export const __ROLES_KEY = "roles";

export function RequireRoles(
  roles: string | string[],
  operation: RoleOperation = "ALL",
): MethodDecorator & ClassDecorator {
  if (!roles || (Array.isArray(roles) && roles.length === 0)) {
    throw new Error("RequireRoles must be called with at least one role");
  }

  const requirement: RoleRequirement = {
    roles: Array.isArray(roles) ? roles : [roles],
    operation,
  };

  return SetMetadata(__ROLES_KEY, requirement);
}
