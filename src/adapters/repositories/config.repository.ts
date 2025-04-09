import { Config } from "@modules/core/entities/config.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager, FindOneOptions } from "typeorm";

@Injectable()
export class ConfigRepository extends Repository<Config> {
  private readonly logger = new Logger(ConfigRepository.name);

  constructor(
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
    private readonly entityManager: EntityManager,
  ) {
    super(
      configRepository.target,
      configRepository.manager,
      configRepository.queryRunner,
    );
  }

  async findConfig(filter: FindOneOptions<Config>): Promise<Config> {
    return this.findOne(filter);
  }
}
