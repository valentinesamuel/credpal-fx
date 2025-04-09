import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyUserDto {
  @ApiProperty({
    description: "The first name of the user",
    type: "string",
    required: true,
    example: "John",
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: "The email address of the user",
    type: "string",
    required: true,
    example: "user@example.com",
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
