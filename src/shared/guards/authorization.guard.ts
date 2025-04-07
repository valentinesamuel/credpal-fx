import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly logger = new Logger(AuthorizationGuard.name);

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Get the token from the request headers
    const accessKey =
      req?.headers[this.configService.get<string>("common.auth.authName")];

    if (!accessKey) {
      this.logger.error("❌ ERR_CREDPAL_1: Request is forbidden");
      throw new ForbiddenException("Request is forbidden", "ERR_CREDPAL_1");
    }

    const token = this.configService.get<string>("common.auth.authSecret");

    if (accessKey !== token) {
      this.logger.error("❌ ERR_CREDPAL_2: Request is forbidden");
      throw new ForbiddenException("Request is forbidden", "ERR_CREDPAL_2");
    }

    this.logger.log("✅ Request is authorized for public routes");
    return true;
  }
}
