import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RegisterUserDto {
  @ApiProperty({
    description: "The email address of the user",
    type: "string",
    required: true,
    example: "user@example.com",
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "The password of the user",
    type: "string",
    required: true,
    example: "password",
  })
  @IsString()
  @IsNotEmpty()
  password: string;

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
    description: "The last name of the user",
    type: "string",
    required: true,
    example: "Doe",
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;
}
