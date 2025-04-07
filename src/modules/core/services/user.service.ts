import {
  PartialPickUser,
  UserRepository,
} from "@adapters/repositories/user.repository";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AppLogger } from "@shared/observability/logger";
import { User } from "../entities/user.entity";

@Injectable()
export class UserService {
  private readonly logger = new AppLogger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async addUser(userData: Partial<User>) {
    return this.userRepository.createUser(userData);
  }

  async findUserById(id: string) {
    return this.userRepository.findOne({ where: { id: id } });
  }

  async findUserByData(userData: Partial<Pick<User, "id" | "email">>) {
    return this.userRepository.getUserByData(userData);
  }

  async findUserAndFailIfExist(filter: {
    email?: string;
    id?: string;
  }): Promise<void> {
    const user = await this.userRepository.getUserByData(filter);
    if (user) {
      throw new ConflictException("This user already exists");
    }
  }

  async findUserAndFailIfNotExist(filter: {
    email?: string;
    phoneNumber?: string;
    id?: string;
  }) {
    const user = await this.userRepository.getUserByData(filter);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async updateUserByData(userData: PartialPickUser, data: Partial<User>) {
    return this.userRepository.findOneAndUpdateByData(userData, data);
  }
}
