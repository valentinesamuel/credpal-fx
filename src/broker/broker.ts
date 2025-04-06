import { Injectable, Logger } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { Usecase } from "./types";

@Injectable()
export class Broker {
  private readonly logger = new Logger(Broker.name);

  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async runUsecases(
    usecases: Usecase[],
    initialArguments: Record<string, any> = {},
  ): Promise<any> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        this.logger.debug(`Running ${usecases.length} usecases`);
        this.logger.debug(`Initial args: ${JSON.stringify(initialArguments)}`);

        let results = { ...initialArguments };

        for (const useCase of usecases) {
          this.logger.debug(`Running usecase: ${useCase.constructor.name}`);
          const result = await useCase.execute(
            transactionalEntityManager,
            results,
          );
          results = { ...results, ...result };
        }

        //Remove initial args from results
        for (const key in initialArguments) {
          delete results[key];
          if (results?.password) {
            delete results?.password;
          }
        }

        this.logger.debug(`Final results: ${JSON.stringify(results)}`);
        return results;
      },
    );
  }
}
