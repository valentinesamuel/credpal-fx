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
    description: "The phone number of the user",
    type: "string",
    required: true,
    example: "+2348123456789",
  })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;
}
