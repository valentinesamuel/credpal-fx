import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AppLogger } from "@shared/observability/logger";
import { RegisterUserDto } from "../dto/registerUser.dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  RegisterUserCommand,
  VerifyOtpCommand,
} from "../commands/commandHandlers";
import { GetUserByIdQuery } from "../queries/queryHandlers";
import { VerifyOtpDto } from "../dto/verifyOtp.dto";
import { OtpGuard } from "@modules/otp/guards/otp.guard";
import { InitializeUserWalletCommand } from "@modules/wallet/commands/commandHandlers";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  private readonly logger = new AppLogger(AuthController.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Post("register")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "register", summary: "register a new user" })
  @ApiOkResponse({ description: "user registered" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.commandBus.execute(new RegisterUserCommand(registerUserDto));
  }

  @UseGuards(OtpGuard)
  @Post("verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "verify", summary: "verify a user" })
  @ApiOkResponse({ description: "user verified" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  async verify(@Body() verifyOtpDto: VerifyOtpDto) {
    const result = await this.commandBus.execute(
      new VerifyOtpCommand(verifyOtpDto),
    );

    const wallet = await this.commandBus.execute(
      new InitializeUserWalletCommand(result.user),
    );

    result.user.wallet = wallet;

    return { result };
  }
}
