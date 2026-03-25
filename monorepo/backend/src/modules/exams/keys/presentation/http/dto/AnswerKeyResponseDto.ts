import { ApiProperty } from '@nestjs/swagger';

export class AnswerKeyResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly examVersionId: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly examVersionQuestionId: string;

  @ApiProperty({ example: 'AB' })
  readonly correctAnswer: string;

  constructor(id: string, examVersionId: string, examVersionQuestionId: string, correctAnswer: string) {
    this.id = id;
    this.examVersionId = examVersionId;
    this.examVersionQuestionId = examVersionQuestionId;
    this.correctAnswer = correctAnswer;
  }
}
