import { CacheAdapter } from "@adapters/cache/cache.adapter";
import { UserService } from "@modules/core/services/user.service";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import {
  __PERMISSIONS_KEY,
  PermissionOperation,
  PermissionRequirement,
  PermissionValidationResult,
} from "@shared/decorators/permission.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private userService: UserService,
    private cacheAdapter: CacheAdapter,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionRequirement =
      this.reflector.getAllAndOverride<PermissionRequirement>(
        __PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

    // If no permissions are required, allow access
    if (!permissionRequirement) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.error(
        "User not found in request. Ensure JwtAuthGuard runs first",
      );
      throw new ForbiddenException("User not authenticated");
    }

    // Fetch user's permissions from DB/Redis
    let userPermissions: string[];

    const cachedUserPermissions = await this.cacheAdapter.get(
      `permissions<rn>${user.id}`,
    );

    if (
      cachedUserPermissions &&
      cachedUserPermissions.expires > new Date().getTime()
    ) {
      userPermissions = JSON.parse(cachedUserPermissions.value);
    } else {
      const freshUserPermissions = await this.userService.getPermissions(
        user.id,
      );
      userPermissions = freshUserPermissions;
      await this.cacheAdapter.set(
        `permissions<rn>${user.id}`,
        JSON.stringify(freshUserPermissions),
        Number(this.configService.get<number>("cache.ttl")),
      );
    }

    // Validate if user has required permissions
    const { isValid, missingPermissions } = this.validatePermissions(
      permissionRequirement.permissions,
      userPermissions,
      permissionRequirement.operation,
    );

    if (!isValid) {
      this.logger.error(
        `User ${user.id} does not have the required permissions: ${missingPermissions.join(", ")}`,
      );
      throw new ForbiddenException(`Insufficient Permissions`);
    }

    this.logger.log(
      `✅ Request is authorized for permissions: ${permissionRequirement.permissions.join(", ")}`,
    );
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
      operation === "ANY"
        ? missingPermissions.length < requiredPermissions.length
        : missingPermissions.length === 0;

    return { isValid, missingPermissions };
  }
}
