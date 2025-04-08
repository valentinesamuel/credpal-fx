import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class PrivateRouteGuard implements CanActivate {
  private readonly logger = new Logger(PrivateRouteGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException("Unauthorized");
    }

    const decryptedToken = await this.jwtService.verifyAsync(token);

    if (!decryptedToken) {
      throw new UnauthorizedException("Unauthorized");
    }

    this.logger.log("✅ Request is authorized for private routes");
    return true;
  }
}
