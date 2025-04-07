import { Injectable } from "@nestjs/common";
import { Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, EntityManager, Repository } from "typeorm";
import { User } from "@modules/core/entities/user.entity";

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

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.entityManager.create(User, userData);
    return this.userRepository.save(user);
  }

  async getUserByData(
    userData: Partial<Pick<User, "id" | "email">>,
  ): Promise<User> {
    return this.userRepository.findOne({
      where: [{ email: userData?.email }, { id: userData?.id }],
      select: ["id", "firstName", "lastName", "email", "createdAt"],
      relations: ["wallets"],
    });
  }

  async findOneAndDeleteById(id: string): Promise<DeleteResult> {
    return this.userRepository.softDelete({ id });
  }

  async findOneAndUpdateById(id: string, data: Partial<User>) {
    return this.userRepository.update({ id }, data);
  }
}
