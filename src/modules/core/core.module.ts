import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@modules/core/entities/user.entity";
import { UtilityService } from "@shared/utils/utility.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UtilityService],
  exports: [UtilityService],
})
export class CoreModule {}
