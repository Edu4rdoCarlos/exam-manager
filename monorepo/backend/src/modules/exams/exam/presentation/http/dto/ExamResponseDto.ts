import { ApiProperty } from '@nestjs/swagger';

export class ExamResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'Prova de Cálculo I' })
  readonly title: string;

  @ApiProperty({ example: 'Cálculo' })
  readonly subject: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly teacherId: string;

  @ApiProperty({ example: '2026-06-15T00:00:00.000Z', nullable: true })
  readonly examDate: Date | null;

  @ApiProperty({ enum: ['letters', 'powers_of_two'], example: 'letters' })
  readonly answerFormat: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  readonly createdAt: Date | null;

  constructor(
    id: string,
    title: string,
    subject: string,
    teacherId: string,
    examDate: Date | null,
    answerFormat: string,
    createdAt: Date | null,
  ) {
    this.id = id;
    this.title = title;
    this.subject = subject;
    this.teacherId = teacherId;
    this.examDate = examDate;
    this.answerFormat = answerFormat;
    this.createdAt = createdAt;
  }
}
