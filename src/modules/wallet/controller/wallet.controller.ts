import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { RequireRoles } from "@shared/decorators/role.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt.guard";
import { PermissionsGuard } from "@shared/guards/permission.guard";
import { RolesGuard } from "@shared/guards/role.guard";
import { ROLES } from "@shared/guards/enums/roles.enum";
import { AppLogger } from "@shared/observability/logger";
import { GetWalletQuery } from "../queries/queryHandlers";
import { QueryBus } from "@nestjs/cqrs";
import { Request } from "express";
import { User } from "@modules/core/entities/user.entity";
import { RequirePermissions } from "@shared/decorators/permission.decorator";
import { PERMISSIONS } from "@shared/guards/enums/permission.enum";

@ApiTags("Wallet")
@Controller("wallet")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class WalletController {
  private readonly logger = new AppLogger(WalletController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @RequireRoles([ROLES.USER, ROLES.ADMIN], "ANY")
  @RequirePermissions(
    [PERMISSIONS.CAN_VIEW_WALLET, PERMISSIONS.CAN_CREATE_WALLET],
    "ANY",
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getWallet", summary: "get user wallet" })
  @ApiOkResponse({ description: "user wallet" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  getWallet(@Req() req: Request & { user: User }) {
    const userId = req.user.id as string;
    return this.queryBus.execute(new GetWalletQuery(userId));
  }
}
