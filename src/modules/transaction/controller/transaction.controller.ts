import { Controller, Get, HttpCode, HttpStatus, Req } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AppLogger } from "@shared/observability/logger";
import { QueryBus } from "@nestjs/cqrs";
import { GetAllTransactionsQuery } from "../queries/queryHandlers";
import { User } from "@modules/core/entities/user.entity";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@shared/guards/jwt.guard";
import { PermissionsGuard } from "@shared/guards/permission.guard";
import { RolesGuard } from "@shared/guards/role.guard";
import { RequireRoles } from "@shared/decorators/role.decorator";
import { ROLES } from "@shared/guards/enums/roles.enum";
import { RequirePermissions } from "@shared/decorators/permission.decorator";
import { PERMISSIONS } from "@shared/guards/enums/permission.enum";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiTags("Transaction")
@Controller("transaction")
export class TransactionController {
  private readonly logger = new AppLogger(TransactionController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Get("")
  @RequireRoles([ROLES.USER, ROLES.ADMIN], "ANY")
  @RequirePermissions(
    [PERMISSIONS.CAN_VIEW_WALLET, PERMISSIONS.CAN_CREATE_WALLET],
    "ANY",
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "all", summary: "get all transactions" })
  @ApiOkResponse({ description: "transactions retrieved" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  async getAllTransactions(@Req() req: Request & { user: User }) {
    return this.queryBus.execute(new GetAllTransactionsQuery(req.user.id));
  }
}
