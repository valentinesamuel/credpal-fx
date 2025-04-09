import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from "@nestjs/swagger";
import { RequireRoles } from "@shared/decorators/role.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt.guard";
import { PermissionsGuard } from "@shared/guards/permission.guard";
import { RolesGuard } from "@shared/guards/role.guard";
import { ROLES } from "@shared/guards/enums/roles.enum";
import { AppLogger } from "@shared/observability/logger";
import { GetWalletQuery } from "../queries/queryHandlers";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Request } from "express";
import { User } from "@modules/core/entities/user.entity";
import { RequirePermissions } from "@shared/decorators/permission.decorator";
import { PERMISSIONS } from "@shared/guards/enums/permission.enum";
import {
  ConvertCurrencyCommand,
  FundWalletCommand,
  TradeCommand,
} from "../commands/commandHandlers";
import { ConvertCurrencyDto } from "../dto/convertCurrency.dto";
import { TradeDto } from "../dto/trade.dto";

@ApiTags("Wallet")
@Controller("wallet")
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class WalletController {
  private readonly logger = new AppLogger(WalletController.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @RequireRoles([ROLES.USER, ROLES.ADMIN], "ANY")
  @RequirePermissions(
    [PERMISSIONS.CAN_VIEW_WALLET, PERMISSIONS.CAN_CREATE_WALLET],
    "ANY",
  )
  @RequireRoles([ROLES.USER, ROLES.ADMIN], "ANY")
  @RequirePermissions(
    [PERMISSIONS.CAN_VIEW_WALLET, PERMISSIONS.CAN_CREATE_WALLET],
    "ANY",
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getWallet", summary: "get user wallet" })
  @ApiOkResponse({ description: "user wallet details" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  getWallet(@Req() req: Request & { user: User }) {
    const userId = req.user.id as string;
    return this.queryBus.execute(new GetWalletQuery(userId));
  }

  @Post("/fund")
  @RequireRoles([ROLES.USER, ROLES.ADMIN], "ANY")
  @RequirePermissions(
    [PERMISSIONS.CAN_VIEW_WALLET, PERMISSIONS.CAN_CREATE_WALLET],
    "ANY",
  )
  @RequireRoles([ROLES.USER, ROLES.ADMIN], "ANY")
  @RequirePermissions(
    [PERMISSIONS.CAN_VIEW_WALLET, PERMISSIONS.CAN_CREATE_WALLET],
    "ANY",
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "fundWallet", summary: "fund user wallet" })
  @ApiOkResponse({ description: "user wallet funded" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  fundWallet(@Req() req: Request & { user: User }) {
    return this.commandBus.execute(new FundWalletCommand(req.body, req.user));
  }

  @Post("/convert")
  @RequireRoles([ROLES.USER, ROLES.ADMIN], "ANY")
  @RequirePermissions(
    [PERMISSIONS.CAN_VIEW_WALLET, PERMISSIONS.CAN_CREATE_WALLET],
    "ANY",
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "convertCurrency", summary: "convert currency" })
  @ApiOkResponse({ description: "currency converted" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  convertCurrency(
    @Req() req: Request & { user: User },
    @Body() body: ConvertCurrencyDto,
  ) {
    return this.commandBus.execute(new ConvertCurrencyCommand(body, req.user));
  }

  @Post("trade")
  @RequireRoles([ROLES.USER, ROLES.ADMIN], "ANY")
  @RequirePermissions(
    [PERMISSIONS.CAN_VIEW_WALLET, PERMISSIONS.CAN_CREATE_WALLET],
    "ANY",
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "trade", summary: "trade between currencies" })
  @ApiOkResponse({ description: "trade executed successfully" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  async trade(
    @Body() tradeDto: TradeDto,
    @Req() req: Request & { user: User },
  ) {
    return this.commandBus.execute(new TradeCommand(tradeDto, req.user));
  }
}
