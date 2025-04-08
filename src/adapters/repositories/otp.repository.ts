import { Injectable, Logger } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Otp } from "@modules/core/entities/otp.entity";

@Injectable()
export class OtpRepository extends Repository<Otp> {
  private readonly logger = new Logger(OtpRepository.name);

  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly entityManager: EntityManager,
  ) {
    super(
      otpRepository.target,
      otpRepository.manager,
      otpRepository.queryRunner,
    );
  }

  async createOtp(
    OtpData: Partial<Otp>,
    transactionEntityManager?: EntityManager,
  ): Promise<Otp> {
    const manager = transactionEntityManager || this.entityManager;
    const otp = this.create(OtpData);
    return manager.save(otp);
  }

  async findOtp(
    filter: Partial<
      Pick<Otp, "id" | "userId" | "pinId" | "phoneNumber" | "isActive">
    >,
    transactionEntityManager?: EntityManager,
  ): Promise<Otp> {
    const manager = transactionEntityManager || this.entityManager;
    return manager.findOne(Otp, {
      where: {
        id: filter.id,
        userId: filter.userId,
        pinId: filter.pinId,
        phoneNumber: filter.phoneNumber,
        isActive: filter.isActive,
      },
    });
  }

  async updateOtp(
    id: string,
    otpData: Partial<Otp>,
    transactionEntityManager?: EntityManager,
  ): Promise<Otp> {
    const manager = transactionEntityManager || this.entityManager;
    await manager.update(Otp, { id }, otpData);
    return this.findOtp(
      {
        id,
      },
      transactionEntityManager,
    );
  }
}
