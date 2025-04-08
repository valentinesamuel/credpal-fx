import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { PaymentMethod } from "@modules/core/entities/transaction.entity";

export class FundWalletDto {
  @ApiProperty({
    description: "The amount to fund the wallet",
    type: "number",
    required: true,
    example: 100,
  })
  @IsNotEmpty()
  @IsString()
  amount: number;

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
    description: "The payment method to fund the wallet",
    type: "string",
    required: true,
    example: "BANK_TRANSFER",
    enum: Object.values(PaymentMethod),
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
