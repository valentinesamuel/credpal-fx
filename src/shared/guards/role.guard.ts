import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  __ROLES_KEY,
  RoleRequirement,
} from "@shared/decorators/role.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roleRequirement = this.reflector.getAllAndOverride<RoleRequirement>(
      __ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!roleRequirement) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.error(
        "User not found in request. Ensure JwtAuthGuard runs first",
      );
      throw new ForbiddenException("User not authenticated");
    }

    const hasRequiredRole =
      roleRequirement.operation === "ANY"
        ? roleRequirement.roles.some((role) => {
            const hasRole =
              user.role?.name.toLowerCase() === role.toLowerCase();
            return hasRole;
          })
        : roleRequirement.roles.every(
            (role) => user.role?.name.toLowerCase() === role.toLowerCase(),
          );

    if (!hasRequiredRole) {
      this.logger.error(
        `User ${user.id} does not have the required roles: ${roleRequirement.roles.join(", ")}`,
      );
      throw new ForbiddenException("Insufficient permissions");
    }

    this.logger.log(
      `✅ Request is authorized for roles: ${roleRequirement.roles.join(", ")}`,
    );
    return true;
  }
}
