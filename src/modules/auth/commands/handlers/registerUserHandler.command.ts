import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import * as bcrypt from "bcrypt";
import { AppLogger } from "@shared/observability/logger";
import { UserService } from "@modules/core/services/user.service";
import { Injectable } from "@nestjs/common";
import { RegisterUserCommand } from "../commandHandlers";
import { ConfigService } from "@nestjs/config";
import { OtpService } from "@modules/core/services/otp.service";
import { UtilityService } from "@shared/utils/utility.service";
import { CountryService } from "@modules/country/services/country.service";
import { UnitOfWork } from "@adapters/repositories/transactions/unitOfWork.trx";

@Injectable()
@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler
  implements ICommandHandler<RegisterUserCommand>
{
  private readonly logger = new AppLogger(RegisterUserHandler.name);

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
    private readonly utilityServices: UtilityService,
    private readonly countryService: CountryService,
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(command: RegisterUserCommand) {
    const { payload } = command;

    return this.unitOfWork.executeInTransaction(async () => {
      this.logger.log("Registering user in transaction");

      const hashedPassword = await this.hashPassword(payload.password);

      await this.userService.findUserAndFailIfExist({
        email: payload.email,
      });

      const phoneNumberDetails = this.utilityServices.getPhoneNumberDetails(
        payload.phoneNumber,
      );

      const country = await this.countryService.findCountryAndFailIfNotExist({
        isoAlphaTwoCode: phoneNumberDetails.country.code,
      });

      this.logger.log("User phone number details: ", phoneNumberDetails);

      const user = await this.userService.addUser({
        ...payload,
        password: hashedPassword,
        phoneNumber: payload.phoneNumber,
        countryId: country.id,
      });

      const otp = await this.otpService.generateOtp(payload.email);

      await this.otpService.createOtp(
        {
          phoneNumber: payload.phoneNumber,
          otpCode: otp.otpCode,
        },
        user.id,
      );

      // await this.otpService.sendOtpSms(otp.otpCode, payload.phoneNumber);

      this.logger.log("User registered successfully");
      return {
        feedback: "User registered successfully",
        userId: user.id,
        otp,
      };
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const rounds = Number(
      this.configService.get<string>("common.auth.saltRounds"),
    );
    const salt = await bcrypt.genSalt(rounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }
}
