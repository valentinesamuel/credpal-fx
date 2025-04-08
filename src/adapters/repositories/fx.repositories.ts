import { Injectable, Logger } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { FXRate } from "@modules/core/entities/fxRate.entity";

export type PickFXRateData = Partial<
  Pick<
    FXRate,
    | "id"
    | "baseCurrencyId"
    | "targetCurrencyId"
    | "rate"
    | "provider"
    | "lastUpdated"
    | "nextUpdated"
    | "metadata"
  >
>;

@Injectable()
export class FXRateRepository extends Repository<FXRate> {
  private readonly logger = new Logger(FXRateRepository.name);

  constructor(
    @InjectRepository(FXRate)
    private readonly fxRateRepository: Repository<FXRate>,
    private readonly entityManager: EntityManager,
  ) {
    super(
      fxRateRepository.target,
      fxRateRepository.manager,
      fxRateRepository.queryRunner,
    );
  }
}
