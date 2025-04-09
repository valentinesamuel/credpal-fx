import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ConvertCurrencyDto {
  @ApiProperty({
    description: "The amount to convert",
    type: "number",
    required: true,
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: "The currency to convert from",
    type: "string",
    required: true,
    example: "NGN",
  })
  @IsNotEmpty()
  @IsString()
  sourceCurrency: string;

  @ApiProperty({
    description: "The currency to convert to",
    type: "string",
    required: true,
    example: "USD",
  })
  @IsNotEmpty()
  @IsString()
  targetCurrency: string;
}
