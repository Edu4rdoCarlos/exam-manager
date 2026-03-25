import { ApiProperty } from '@nestjs/swagger';

export class GradeReportStudentDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'Maria Silva' })
  readonly name: string;

  @ApiProperty({ example: '12345678901' })
  readonly cpf: string;

  constructor(id: string, name: string, cpf: string) {
    this.id = id;
    this.name = name;
    this.cpf = cpf;
  }
}

export class GradeReportExamDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'Vestibular 2026' })
  readonly title: string;

  @ApiProperty({ example: 'Mathematics' })
  readonly subject: string;

  constructor(id: string, title: string, subject: string) {
    this.id = id;
    this.title = title;
    this.subject = subject;
  }
}

export class GradeReportExamVersionDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 1 })
  readonly versionNumber: number;

  constructor(id: string, versionNumber: number) {
    this.id = id;
    this.versionNumber = versionNumber;
  }
}

export class GradeReportResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly gradeId: string;

  @ApiProperty({ example: 0.85, description: 'Score from 0.0 to 1.0' })
  readonly score: number;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly correctionId: string;

  @ApiProperty({ type: () => GradeReportStudentDto })
  readonly student: GradeReportStudentDto;

  @ApiProperty({ type: () => GradeReportExamDto })
  readonly exam: GradeReportExamDto;

  @ApiProperty({ type: () => GradeReportExamVersionDto })
  readonly examVersion: GradeReportExamVersionDto;

  constructor(
    gradeId: string,
    score: number,
    correctionId: string,
    student: GradeReportStudentDto,
    exam: GradeReportExamDto,
    examVersion: GradeReportExamVersionDto,
  ) {
    this.gradeId = gradeId;
    this.score = score;
    this.correctionId = correctionId;
    this.student = student;
    this.exam = exam;
    this.examVersion = examVersion;
  }
}
