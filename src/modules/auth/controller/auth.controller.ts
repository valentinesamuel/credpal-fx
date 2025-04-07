import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { AppLogger } from "@shared/observability/logger";
import { RegisterUserDto } from "../dto/registerUser.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  private readonly logger = new AppLogger(AuthController.name);
  constructor() {}

  @Post("register")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "register", summary: "register a new user" })
  @ApiOkResponse({ description: "user registered" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  async register(@Body() registerUserDto: RegisterUserDto) {
    this.logger.log(
      `otp verification in progress for,${registerUserDto.email}`,
    );
  }
}
