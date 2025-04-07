import { RegisterUserDto } from "../dto/registerUser.dto";

export class RegisterUserCommand {
  constructor(public readonly payload: RegisterUserDto) {}
}
