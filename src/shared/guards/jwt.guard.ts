import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CacheAdapter } from "@adapters/cache/cache.adapter";
import { UserService } from "@modules/core/services/user.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly cacheAdapter: CacheAdapter,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException("Token not provided");
    }

    try {
      // Verify JWT token
      const payload: { id: string; email: string } =
        await this.jwtService.verifyAsync(token);

      // Check if token is on denied list (blacklist)
      const isDenied = await this.cacheAdapter.get(`blacklist:${token}`);
      if (isDenied) {
        this.cacheAdapter.revoke(`blacklist:${token}`);
        throw new UnauthorizedException("Token has been revoked");
      }

      // Fetch User Details from cache, if nothing is there, then fetch from DB
      const cachedUser = await this.cacheAdapter.get(`user<rn>${payload.id}`);

      if (!cachedUser || cachedUser.expires > new Date().getTime()) {
        const user = await this.userService.findUserByIdWithRoles(payload.id);
        this.cacheAdapter.set(
          `user<rn>${payload.id}`,
          JSON.stringify(user),
          Number(this.configService.get<number>("cache.ttl")),
        );
        delete user.password;
        req.user = user;
      } else {
        const user = JSON.parse(cachedUser.value);
        req.user = user;
      }

      this.logger.log("✅ JWT validation successful");
      return true;
    } catch (error) {
      this.logger.error(`🚫 JWT Authorization failed: ${error.message}`);
      throw new UnauthorizedException("Invalid token");
    }
  }
}
