import { SetMetadata } from "@nestjs/common";

export type PermissionOperation = "ANY" | "ALL";

export interface PermissionRequirement {
  permissions: string[];
  operation: PermissionOperation;
}

export interface PermissionValidationResult {
  isValid: boolean;
  missingPermissions: string[];
}

export const __PERMISSIONS_KEY = "permissions";

export function RequirePermissions(
  permissions: string | string[],
  operation: PermissionOperation = "ALL",
): MethodDecorator & ClassDecorator {
  if (
    !permissions ||
    (Array.isArray(permissions) && permissions.length === 0)
  ) {
    throw new Error(
      "RequirePermissions must be called with at least one permission",
    );
  }

  const requirement: PermissionRequirement = {
    permissions: Array.isArray(permissions) ? permissions : [permissions],
    operation,
  };

  return SetMetadata(__PERMISSIONS_KEY, requirement);
}
