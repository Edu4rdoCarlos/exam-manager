import { ApiProperty } from '@nestjs/swagger';

export class AnswerKeyResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  examVersionId!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  examVersionQuestionId!: string;

  @ApiProperty({ example: 'AB' })
  correctAnswer!: string;
}
