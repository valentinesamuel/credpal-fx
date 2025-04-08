import { Injectable, NotFoundException } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, EntityManager, Repository } from "typeorm";
import { User } from "@modules/core/entities/user.entity";

export type PartialPickUser = Partial<
  Pick<User, "id" | "email" | "phoneNumber">
>;

@Injectable()
export class UserRepository extends Repository<User> {
  private readonly logger = new Logger(UserRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {
    super(
      userRepository.target,
      userRepository.manager,
      userRepository.queryRunner,
    );
  }

  async createUser(
    userData: Partial<User>,
    transactionEntityManager?: EntityManager,
  ): Promise<User> {
    const manager = transactionEntityManager || this.entityManager;
    const user = this.entityManager.create(User, userData);
    return manager.save(user);
  }

  async getUserByData(
    userData: PartialPickUser,
    transactionEntityManager?: EntityManager,
  ): Promise<User> {
    const manager = transactionEntityManager || this.entityManager;
    return manager.findOne(User, {
      where: [
        { email: userData?.email },
        { id: userData?.id },
        { phoneNumber: userData?.phoneNumber },
      ],
      relations: ["wallet", "country", "role"],
    });
  }

  async findOneAndDeleteById(
    id: string,
    transactionEntityManager?: EntityManager,
  ): Promise<DeleteResult> {
    const manager = transactionEntityManager || this.entityManager;
    return manager.softDelete(User, { id });
  }

  async findOneAndUpdateByData(
    userData: PartialPickUser,
    data: Partial<User>,
    transactionEntityManager?: EntityManager,
  ) {
    const manager = transactionEntityManager || this.entityManager;
    const user = await this.getUserByData(userData, transactionEntityManager);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    await manager.update(User, { id: user.id }, data);
    return this.getUserByData({ id: user.id }, transactionEntityManager);
  }
}
