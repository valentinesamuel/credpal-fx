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

  async createOtp(OtpData: Partial<Otp>): Promise<Otp> {
    const otp = this.create(OtpData);
    return this.save(otp);
  }

  async findOtp(filter: Partial<Pick<Otp, "id" | "pinId">>): Promise<Otp> {
    return this.findOne({
      where: {
        id: filter.id,
        pinId: filter.pinId,
      },
    });
  }

  async updateOtp(id: string, otpData: Partial<Otp>): Promise<Otp> {
    await this.update({ id }, otpData);
    return this.findOtp({
      id,
    });
  }
}
