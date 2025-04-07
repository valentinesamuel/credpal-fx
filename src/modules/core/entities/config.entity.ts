import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity } from "typeorm";

export enum DestinationTypeEnum {
  EMAIL = "email",
  SMS = "sms",
}

@Entity()
export class Config extends BaseEntity {
  @Column({ type: "varchar" })
  provider: string;

  @Column({ type: "enum", enum: DestinationTypeEnum })
  type: DestinationTypeEnum;

  @Column({ type: "boolean" })
  isActive: boolean;
}
