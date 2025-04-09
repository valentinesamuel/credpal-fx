import { Body, Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AppLogger } from "@shared/observability/logger";
import { QueryBus } from "@nestjs/cqrs";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@shared/guards/jwt.guard";
import { PermissionsGuard } from "@shared/guards/permission.guard";
import { RolesGuard } from "@shared/guards/role.guard";
import { GetFXRatesQuery } from "./queries/queryHandlers";
import { RequirePermissions } from "@shared/decorators/permission.decorator";
import { PERMISSIONS } from "@shared/guards/enums/permission.enum";
import { RequireRoles } from "@shared/decorators/role.decorator";
import { ROLES } from "@shared/guards/enums/roles.enum";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiTags("FX")
@Controller("fx")
export class FxRateController {
  private readonly logger = new AppLogger(FxRateController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Get("/rates")
  @RequireRoles([ROLES.USER, ROLES.ADMIN], "ANY")
  @RequirePermissions(
    [PERMISSIONS.CAN_VIEW_WALLET, PERMISSIONS.CAN_CREATE_WALLET],
    "ANY",
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "rates", summary: "get fx rates" })
  @ApiOkResponse({ description: "fx rates retrieved" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  async getFXRates(@Body() body: { currencyCode: string }) {
    return this.queryBus.execute(new GetFXRatesQuery(body.currencyCode));
  }
}
