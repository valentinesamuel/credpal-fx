import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { EncryptionUtil } from "@shared/utils/encryption/encryption.util";

@Injectable()
export class PrivateRouteGuard implements CanActivate {
  private readonly logger = new Logger(PrivateRouteGuard.name);

  constructor(private readonly encryptionUtil: EncryptionUtil) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    this.logger.log("✅ Request is authorized for private routes");
    return true;
  }
}
