import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class FundWalletDto {
  @ApiProperty({
    description: "The amount to fund the wallet",
    type: "string",
    required: true,
    example: "100",
  })
  @IsNotEmpty()
  @IsString()
  amount: string;

  @ApiProperty({
    description: "The currency to fund the wallet",
    type: "string",
    required: true,
    example: "NGN",
  })
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({
    description: "The user ID of the wallet to fund",
    type: "string",
    required: true,
    example: "1",
  })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
