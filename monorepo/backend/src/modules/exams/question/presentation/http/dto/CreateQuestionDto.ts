import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AlternativeDto {
  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsBoolean()
  isCorrect!: boolean;
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  statement!: string;

  @ApiProperty({ type: [AlternativeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativeDto)
  alternatives!: AlternativeDto[];
}
