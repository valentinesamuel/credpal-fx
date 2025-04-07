import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyOtpDto {
  @ApiProperty({
    description: "The OTP code to verify",
    type: "string",
    required: true,
    example: "123456",
  })
  @IsString()
  @IsNotEmpty()
  otpCode: string;

  @ApiProperty({
    description: "The email of the user",
    type: "string",
    required: true,
    example: "user@example.com",
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
