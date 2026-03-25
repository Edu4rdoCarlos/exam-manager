import { ApiProperty } from '@nestjs/swagger';
import { AnswerFormat } from '../../../../exams/domain/exam/Exam';

export class UserMeExamDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'Prova de Cálculo I' })
  readonly title: string;

  @ApiProperty({ example: 'Cálculo' })
  readonly subject: string;

  @ApiProperty({ example: '2026-06-15T00:00:00.000Z', nullable: true })
  readonly examDate: Date | null;

  @ApiProperty({ enum: ['letters', 'powers_of_two'] })
  readonly answerFormat: AnswerFormat;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  readonly createdAt: Date | null;

  constructor(id: string, title: string, subject: string, examDate: Date | null, answerFormat: AnswerFormat, createdAt: Date | null) {
    this.id = id;
    this.title = title;
    this.subject = subject;
    this.examDate = examDate;
    this.answerFormat = answerFormat;
    this.createdAt = createdAt;
  }
}

export class UserMeResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'Prof. Silva' })
  readonly name: string;

  @ApiProperty({ example: 'silva@ufpe.br' })
  readonly email: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  readonly createdAt: Date | null;

  @ApiProperty({ type: [UserMeExamDto] })
  readonly exams: UserMeExamDto[];

  constructor(id: string, name: string, email: string, createdAt: Date | null, exams: UserMeExamDto[]) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
    this.exams = exams;
  }
}
