import { Controller, Get } from "@nestjs/common";
import { AppLogger } from "@shared/observability/logger";

@Controller()
export class AppController {
  private readonly logger = new AppLogger(AppController.name);
  constructor() {}

  @Get()
  getHello() {
    this.logger.log("Hello World!");
  }
}
