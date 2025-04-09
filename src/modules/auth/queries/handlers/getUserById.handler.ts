import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserService } from "@modules/core/services/user.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AppLogger } from "@shared/observability/logger";
import { GetUserByIdQuery } from "../queryHandlers";

@Injectable()
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  private readonly logger = new AppLogger(GetUserByIdHandler.name);

  constructor(private readonly userService: UserService) {}

  async execute(query: GetUserByIdQuery) {
    this.logger.log(`Fetching user with ID: ${query.userId}`);
    const user = await this.userService.findUserByIdWithRoles(query.userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${query.userId} not found`);
    }

    return user;
  }
}
