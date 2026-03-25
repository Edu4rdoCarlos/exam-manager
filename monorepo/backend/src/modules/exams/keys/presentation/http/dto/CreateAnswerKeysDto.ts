import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerKeyItemDto {
  @ApiProperty()
  @IsUUID()
  examVersionQuestionId!: string;

  @ApiProperty()
  @IsString()
  correctAnswer!: string;
}

export class CreateAnswerKeysDto {
  @ApiProperty()
  @IsUUID()
  examVersionId!: string;

  @ApiProperty({ type: [AnswerKeyItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerKeyItemDto)
  keys!: AnswerKeyItemDto[];
}
