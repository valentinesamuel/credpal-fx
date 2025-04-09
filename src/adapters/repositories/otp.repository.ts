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
  ) {
    super(
      otpRepository.target,
      otpRepository.manager,
      otpRepository.queryRunner,
    );
  }

  async createOtp(OtpData: Partial<Otp>): Promise<Otp> {
    const otp = this.create(OtpData);
    return this.save(otp);
  }

  async findOtp(
    filter: Partial<
      Pick<Otp, "id" | "userId" | "pinId" | "phoneNumber" | "isActive">
    >,
  ): Promise<Otp> {
    return this.findOne({
      where: {
        id: filter.id,
        userId: filter.userId,
        pinId: filter.pinId,
        phoneNumber: filter.phoneNumber,
        isActive: filter.isActive,
      },
    });
  }

  async updateOtp(id: string, otpData: Partial<Otp>): Promise<Otp> {
    await this.update({ id }, otpData);
    return this.findOtp({ id });
  }
}
