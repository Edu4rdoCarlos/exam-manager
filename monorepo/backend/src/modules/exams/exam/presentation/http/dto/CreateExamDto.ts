import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ExamQuestionPositionDto {
  @ApiProperty()
  @IsUUID()
  questionId!: string;

  @ApiProperty()
  @IsInt()
  position!: number;
}

export class CreateExamDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  subject!: string;

  @ApiProperty()
  @IsUUID()
  teacherId!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  examDate?: string;

  @ApiProperty({ enum: ['letters', 'powers_of_two'] })
  @IsEnum(['letters', 'powers_of_two'])
  answerFormat!: 'letters' | 'powers_of_two';

  @ApiProperty({ type: [ExamQuestionPositionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionPositionDto)
  questionIds!: ExamQuestionPositionDto[];
}
