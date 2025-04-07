import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RequireRoles } from "@shared/decorators/role.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt.guard";
import { PermissionsGuard } from "@shared/guards/permission.guard";
import { RolesGuard } from "@shared/guards/role.guard";
import { ROLES } from "@shared/guards/enums/roles.enum";
import { AppLogger } from "@shared/observability/logger";

@ApiTags("Wallet")
@Controller("wallet")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class WalletController {
  private readonly logger = new AppLogger(WalletController.name);

  @Get()
  @RequireRoles([ROLES.USER, ROLES.ADMIN], "ALL")
  getWallet() {}
}
