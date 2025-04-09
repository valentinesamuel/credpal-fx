import { Config } from "@modules/core/entities/config.entity";
import { Role } from "@modules/core/entities/role.entity";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager, FindOneOptions } from "typeorm";

@Injectable()
export class RoleRepository extends Repository<Role> {
  private readonly logger = new Logger(RoleRepository.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly entityManager: EntityManager,
  ) {
    super(
      roleRepository.target,
      roleRepository.manager,
      roleRepository.queryRunner,
    );
  }

  async findRole(filter: FindOneOptions<Role>): Promise<Role> {
    return this.findOne(filter);
  }
}
