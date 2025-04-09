import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class TradeDto {
  @ApiProperty({
    description: "Source currency code",
    example: "USD",
  })
  @IsNotEmpty()
  @IsString()
  sourceCurrency: string;

  @ApiProperty({
    description: "Target currency code",
    example: "EUR",
  })
  @IsNotEmpty()
  @IsString()
  targetCurrency: string;

  @ApiProperty({
    description: "Amount to trade in source currency",
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;
}
