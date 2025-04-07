import { CacheAdapter } from "@adapters/cache/cache.adapter";
import { UserService } from "@modules/core/services/user.service";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  __ROLES_KEY,
  RoleRequirement,
} from "@shared/decorators/role.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private cacheAdadpter: CacheAdapter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const RoleRequirement = this.reflector.getAllAndOverride<RoleRequirement>(
      __ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!RoleRequirement) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Fetch user's roles from DB/Redis
    let userRole: string;

    const cachedUserRole = (await this.cacheAdadpter.get(
      `role:${user.id}`,
    )) as string;

    if (cachedUserRole) {
      userRole = JSON.parse(cachedUserRole);
    } else {
      const freshUserRole = await this.userService.getRole(user.id);
      userRole = freshUserRole;
      await this.cacheAdadpter.set(
        `role:${user.id}`,
        JSON.stringify(freshUserRole),
        60 * 60,
      );
    }

    if (!RoleRequirement.roles.includes(userRole)) {
      throw new ForbiddenException(
        `User does not have the required role: ${RoleRequirement.roles.join(", ")}`,
      );
    }

    return true;
  }
}
