import {
  Repository,
  ObjectLiteral,
  FindOneOptions,
  DeepPartial,
} from "typeorm";
import { UnitOfWork } from "./unitOfWork.trx";

export abstract class BaseRepository<Entity extends ObjectLiteral> {
  protected constructor(
    protected readonly entityRepository: Repository<Entity>,
    protected readonly unitOfWorkService: UnitOfWork,
  ) {}

  protected get manager() {
    try {
      return this.unitOfWorkService.getManager();
    } catch {
      // Fall back to default repository if no transaction is active
      return this.entityRepository.manager;
    }
  }

  create(entityData: Partial<Entity>): Entity {
    return this.entityRepository.create(entityData as DeepPartial<Entity>);
  }

  async save(entity: Entity): Promise<Entity> {
    return this.manager.save(entity);
  }

  async findOne(options: FindOneOptions<Entity>): Promise<Entity | null> {
    return this.manager.findOne(this.entityRepository.target, options);
  }

  async update(criteria: any, partialEntity: Partial<Entity>): Promise<any> {
    return this.manager.update(
      this.entityRepository.target,
      criteria,
      partialEntity,
    );
  }
}
