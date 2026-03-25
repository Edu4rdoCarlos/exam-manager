import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ExamQuestionPositionDto } from './CreateExamDto';

export class UpdateExamDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  examDate?: string;

  @ApiProperty({ enum: ['letters', 'powers_of_two'], required: false })
  @IsOptional()
  @IsEnum(['letters', 'powers_of_two'])
  answerFormat?: 'letters' | 'powers_of_two';

  @ApiProperty({ type: [ExamQuestionPositionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionPositionDto)
  questionIds?: ExamQuestionPositionDto[];
}
