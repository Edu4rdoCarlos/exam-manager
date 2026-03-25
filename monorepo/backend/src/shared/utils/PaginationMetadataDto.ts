import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadataDto {
  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly limit: number;

  @ApiProperty()
  readonly totalPages: number;

  constructor(total: number, page: number, limit: number, totalPages: number) {
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = totalPages;
  }
}
