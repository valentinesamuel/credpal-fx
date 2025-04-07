import { Injectable } from "@nestjs/common";
import { AppLogger } from "@shared/observability/logger";
import { EntityManager } from "typeorm";
import { RegisterUserDto } from "../dto/registerUser.dto";

@Injectable()
export class RegisterUserUsecase {
  private readonly logger = new AppLogger(RegisterUserUsecase.name);

  async execute(entityManager: EntityManager, args: RegisterUserDto) {
    this.logger.log("User registered successfully");
    return { message: "User registered successfully" };
  }
}
