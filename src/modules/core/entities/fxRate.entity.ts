import { BaseEntity } from "@shared/repositoryHelpers/base.entity";
import { Column, Entity, Index, Unique } from "typeorm";

@Unique(["baseCurrencyId", "targetCurrencyId", "provider"])
@Entity()
export class FXRate extends BaseEntity {
  @Index()
  @Column({ type: "varchar" })
  baseCurrencyId: string;

  @Index()
  @Column({ type: "varchar" })
  targetCurrencyId: string;

  @Column({ type: "decimal" })
  rate: number;

  @Column({ type: "varchar" })
  provider: string;

  @Column({ type: "timestamp with time zone" })
  lastUpdated: Date;

  @Column({ type: "timestamp with time zone" })
  nextUpdated: Date;

  @Column({ type: "varchar" })
  metadata: Record<string, any>;
}
