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

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiTags("FX")
@Controller("fx")
export class FxRateController {
  private readonly logger = new AppLogger(FxRateController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Get("/rates")
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
