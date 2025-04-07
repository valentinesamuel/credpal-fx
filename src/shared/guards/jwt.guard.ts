import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from "@nestjs/common";
import { EncryptionUtil } from "@shared/utils/encryption/encryption.util";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";
import { CacheAdapter } from "@adapters/cache/cache.adapter";

// Define metadata key for roles
export const ROLES_KEY = "roles";
// Create roles decorator
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly encryptionUtil: EncryptionUtil,
    private readonly jwtService: JwtService,
    private reflector: Reflector,
    private readonly cacheAdapter: CacheAdapter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException("Token not provided");
    }

    // Decrypt the token first if you're encrypting it
    const decryptedToken = this.encryptionUtil.decrypt(token);
    if (!decryptedToken) {
      throw new UnauthorizedException("Invalid token");
    }

    try {
      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(decryptedToken);

      // Check if token is on denied list (blacklist)
      const isDenied = await this.cacheAdapter.get(
        `blacklist:${decryptedToken}`,
      );
      if (isDenied) {
        this.cacheAdapter.revoke(`blacklist:${decryptedToken}`);
        throw new UnauthorizedException("Token has been revoked");
      }

      // Add user info to request object
      req.user = payload;

      // Role-based access control
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      // If no specific roles are required, allow access
      if (!requiredRoles || requiredRoles.length === 0) {
        this.logger.log("✅ Request is authorized for private routes");
        return true;
      }

      // Check if the user has the required role
      const hasRequiredRole = requiredRoles.some((role) =>
        payload.roles?.includes(role),
      );

      if (!hasRequiredRole) {
        throw new ForbiddenException("Insufficient permissions");
      }

      this.logger.log(
        `✅ Request is authorized for roles: ${requiredRoles.join(", ")}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`🚫 Authorization failed: ${error.message}`);
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new UnauthorizedException("Invalid token");
    }
  }
}
