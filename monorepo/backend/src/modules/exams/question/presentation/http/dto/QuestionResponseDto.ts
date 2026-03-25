import { ApiProperty } from '@nestjs/swagger';

export class AlternativeResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  questionId!: string;

  @ApiProperty({ example: 'Brasília' })
  description!: string;

  @ApiProperty({ example: true })
  isCorrect!: boolean;
}

export class QuestionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Qual é a capital do Brasil?' })
  statement!: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  updatedAt!: Date | null;

  @ApiProperty({ type: [AlternativeResponseDto] })
  alternatives!: AlternativeResponseDto[];
}
