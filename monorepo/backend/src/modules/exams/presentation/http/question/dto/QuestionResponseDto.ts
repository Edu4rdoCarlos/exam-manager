import { ApiProperty } from '@nestjs/swagger';

export class AlternativeResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly questionId: string;

  @ApiProperty({ example: 'Brasília' })
  readonly description: string;

  @ApiProperty({ example: true })
  readonly isCorrect: boolean;

  constructor(id: string, questionId: string, description: string, isCorrect: boolean) {
    this.id = id;
    this.questionId = questionId;
    this.description = description;
    this.isCorrect = isCorrect;
  }
}

export class QuestionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'Qual é a capital do Brasil?' })
  readonly statement: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  readonly createdAt: Date | null;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  readonly updatedAt: Date | null;

  @ApiProperty({ type: [AlternativeResponseDto] })
  readonly alternatives: AlternativeResponseDto[];

  constructor(
    id: string,
    statement: string,
    createdAt: Date | null,
    updatedAt: Date | null,
    alternatives: AlternativeResponseDto[],
  ) {
    this.id = id;
    this.statement = statement;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.alternatives = alternatives;
  }
}
