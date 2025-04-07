import { RegisterUserDto } from "../dto/registerUser.dto";
import { VerifyOtpDto } from "../dto/verifyOtp.dto";
import { VerifyUserDto } from "../dto/verifyUser.dto";

export class RegisterUserCommand {
  constructor(public readonly payload: RegisterUserDto) {}
}

export class VerifyOtpCommand {
  constructor(public readonly payload: VerifyOtpDto) {}
}

export class VerifyUserCommand {
  constructor(public readonly payload: VerifyUserDto) {}
}
