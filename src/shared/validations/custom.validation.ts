import { BadRequestException, ValidationPipe } from "@nestjs/common";

export const CustomFieldValidationPipe = new ValidationPipe({
  exceptionFactory: (errors) => new BadRequestException(errors),
});
