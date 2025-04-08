import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AppLogger } from "@shared/observability/logger";
import { QueryBus } from "@nestjs/cqrs";
import { User } from "@modules/core/entities/user.entity";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "@shared/guards/jwt.guard";
import { PermissionsGuard } from "@shared/guards/permission.guard";
import { RolesGuard } from "@shared/guards/role.guard";

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiTags("FX")
@Controller("fx")
export class FxRateController {
  private readonly logger = new AppLogger(FxRateController.name);

  constructor(private readonly queryBus: QueryBus) {}

  @Post("/rates")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "rates", summary: "get fx rates" })
  @ApiOkResponse({ description: "fx rates retrieved" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  async getFXRates(@Req() req: Request & { user: User }) {
    // return this.queryBus.execute();
  }
}
