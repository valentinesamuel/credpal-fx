export interface IPaged<T> {
  data: T;
  meta: IPagedMeta;
}

export interface IPagedMeta {
  page: number;
  limit: number;
  totalRecords: number;
  previousPage: boolean | number;
  nextPage: boolean | number;
  pageCount: number;
}

import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, ValidateNested } from "class-validator";

export class PagedMetaDto implements IPagedMeta {
  @ApiProperty({ description: "Total number of items" })
  @IsNumber()
  total: number;

  @ApiProperty({ description: "Current page number" })
  @IsNumber()
  page: number;

  @ApiProperty({ description: "Number of items per page" })
  @IsNumber()
  limit: number;

  @ApiProperty({ description: "Number of items in the current page" })
  @IsNumber()
  count: number;

  @ApiProperty({ description: "Page number of the previous page" })
  @IsNumber()
  previousPage: boolean | number;

  @ApiProperty({ description: "Page number of the next page" })
  @IsNumber()
  nextPage: boolean | number;

  @ApiProperty({ description: "Total number of pages" })
  @IsNumber()
  pageCount: number;

  @ApiProperty({ description: "Total records" })
  @IsNumber()
  totalRecords: number;
}

export class PagedDto<T> implements IPaged<T> {
  @ApiProperty({
    description: "Array of data items",
    type: "array",
    isArray: true,
  })
  @ValidateNested({ each: true })
  data: T;

  @ApiProperty({ description: "Pagination metadata" })
  @ValidateNested()
  @Type(() => PagedMetaDto)
  meta: PagedMetaDto;
}
