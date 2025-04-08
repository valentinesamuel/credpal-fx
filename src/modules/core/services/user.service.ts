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

  async findUserByIdWithRoles(id: string) {
    return this.userRepository.findOne({
      where: { id },
      relations: [
        "role",
        "role.rolePermissions",
        "role.rolePermissions.permission",
        "role.rolePermissions.role",
      ],
    });
  }

  async findUserByData(userData: Partial<Pick<User, "id" | "email">>) {
    return this.userRepository.getUserByData(userData);
  }

  async findUserAndFailIfExist(filter: {
    email?: string;
    id?: string;
    phoneNumber?: string;
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

  async getPermissions(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        "role",
        "role.rolePermissions",
        "role.rolePermissions.permission",
      ],
    });
    return user.role.rolePermissions.map(
      (rolePermission) => rolePermission.permission.action,
    );
  }

  async getRole(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["role"],
    });
    return user.role.name;
  }
}
