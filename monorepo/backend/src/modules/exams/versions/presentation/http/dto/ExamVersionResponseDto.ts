import { ApiProperty } from '@nestjs/swagger';

export class ExamVersionAlternativeResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly examVersionQuestionId: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly alternativeId: string;

  @ApiProperty({ example: 1 })
  readonly position: number;

  @ApiProperty({ example: 'A' })
  readonly label: string;

  constructor(
    id: string,
    examVersionQuestionId: string,
    alternativeId: string,
    position: number,
    label: string,
  ) {
    this.id = id;
    this.examVersionQuestionId = examVersionQuestionId;
    this.alternativeId = alternativeId;
    this.position = position;
    this.label = label;
  }
}

export class ExamVersionQuestionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly examVersionId: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly questionId: string;

  @ApiProperty({ example: 1 })
  readonly position: number;

  @ApiProperty({ type: [ExamVersionAlternativeResponseDto] })
  readonly examVersionAlternatives: ExamVersionAlternativeResponseDto[];

  constructor(
    id: string,
    examVersionId: string,
    questionId: string,
    position: number,
    examVersionAlternatives: ExamVersionAlternativeResponseDto[],
  ) {
    this.id = id;
    this.examVersionId = examVersionId;
    this.questionId = questionId;
    this.position = position;
    this.examVersionAlternatives = examVersionAlternatives;
  }
}

export class ExamVersionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly examId: string;

  @ApiProperty({ example: 1 })
  readonly versionNumber: number;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  readonly createdAt: Date | null;

  @ApiProperty({ type: [ExamVersionQuestionResponseDto] })
  readonly examVersionQuestions: ExamVersionQuestionResponseDto[];

  constructor(
    id: string,
    examId: string,
    versionNumber: number,
    createdAt: Date | null,
    examVersionQuestions: ExamVersionQuestionResponseDto[],
  ) {
    this.id = id;
    this.examId = examId;
    this.versionNumber = versionNumber;
    this.createdAt = createdAt;
    this.examVersionQuestions = examVersionQuestions;
  }
}
