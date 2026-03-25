import { ApiProperty } from '@nestjs/swagger';

export class ExamVersionAlternativeResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  examVersionQuestionId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  alternativeId!: string;

  @ApiProperty({ example: 1 })
  position!: number;

  @ApiProperty({ example: 'A' })
  label!: string;
}

export class ExamVersionQuestionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  examVersionId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  questionId!: string;

  @ApiProperty({ example: 1 })
  position!: number;

  @ApiProperty({ type: [ExamVersionAlternativeResponseDto] })
  examVersionAlternatives!: ExamVersionAlternativeResponseDto[];
}

export class ExamVersionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  examId!: string;

  @ApiProperty({ example: 1 })
  versionNumber!: number;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ type: [ExamVersionQuestionResponseDto] })
  examVersionQuestions!: ExamVersionQuestionResponseDto[];
}
