import { ApiProperty } from '@nestjs/swagger';

export class StudentAnswerResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly studentId: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly examVersionId: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly questionId: string;

  @ApiProperty({ example: 'AB' })
  readonly answer: string;

  constructor(id: string, studentId: string, examVersionId: string, questionId: string, answer: string) {
    this.id = id;
    this.studentId = studentId;
    this.examVersionId = examVersionId;
    this.questionId = questionId;
    this.answer = answer;
  }
}
