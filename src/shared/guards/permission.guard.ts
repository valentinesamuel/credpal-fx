import { CacheAdapter } from "@adapters/cache/cache.adapter";
import { UserService } from "@modules/core/services/user.service";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  __PERMISSIONS_KEY,
  PermissionOperation,
  PermissionRequirement,
  PermissionValidationResult,
} from "@shared/decorators/permission.decorator";
import { AppLogger } from "@shared/observability/logger";

@Injectable()
export class PermissionsGuard implements CanActivate {
  private logger = new AppLogger(PermissionsGuard.name);
  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private cacheAdadpter: CacheAdapter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const PermissionRequirement =
      this.reflector.getAllAndOverride<PermissionRequirement>(
        __PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!PermissionRequirement) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Fetch user's permissions from DB/Redis
    let userPermissions: string[];

    const cachedUserPermissions = (await this.cacheAdadpter.get(
      `permissions:${user.id}`,
    )) as string;

    if (cachedUserPermissions) {
      userPermissions = JSON.parse(cachedUserPermissions);
    } else {
      const freshUserPermissions = await this.userService.getPermissions(
        user.id,
      );
      userPermissions = freshUserPermissions;
      await this.cacheAdadpter.set(
        `permissions:${user.id}`,
        JSON.stringify(freshUserPermissions),
        60 * 60,
      );
    }

    // know the missing permissions and the operation
    const { isValid, missingPermissions } = this.validatePermissions(
      PermissionRequirement.permissions,
      userPermissions,
      PermissionRequirement.operation,
    );

    if (!isValid) {
      this.logger.error(
        `User ${user.id} does not have the required permissions: ${missingPermissions.join(", ")}`,
      );
      throw new ForbiddenException(`Insufficient Permissions`);
    }

    return true;
  }

  private validatePermissions(
    requiredPermissions: string[],
    userPermissions: string[],
    operation: PermissionOperation,
  ): PermissionValidationResult {
    const missingPermissions = requiredPermissions.filter(
      (perm) => !userPermissions.includes(perm),
    );
    const isValid =
      operation === "ALL" ? missingPermissions.length === 0 : true;
    return { isValid, missingPermissions };
  }
}
