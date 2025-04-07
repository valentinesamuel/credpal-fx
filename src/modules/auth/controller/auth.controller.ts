import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import { RegisterUserCommand } from "../commands/commandHandlers";
import { GetUserByIdQuery } from "../queries/queryHandlers";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  private readonly logger = new AppLogger(AuthController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @Get("user/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ operationId: "getUserById", summary: "get user by id" })
  @ApiOkResponse({ description: "user found" })
  @ApiInternalServerErrorResponse({
    description: "Internal server error",
  })
  async getUserById(@Param("id") userId: string) {
    return this.queryBus.execute(new GetUserByIdQuery(userId));
  }
}
