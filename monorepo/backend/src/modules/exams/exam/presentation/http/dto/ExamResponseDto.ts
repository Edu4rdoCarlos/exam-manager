import { ApiProperty } from '@nestjs/swagger';

export class ExamResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Prova de Cálculo I' })
  title!: string;

  @ApiProperty({ example: 'Cálculo' })
  subject!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  teacherId!: string;

  @ApiProperty({ example: '2026-06-15T00:00:00.000Z', nullable: true })
  examDate!: Date | null;

  @ApiProperty({ enum: ['letters', 'powers_of_two'], example: 'letters' })
  answerFormat!: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  createdAt!: Date | null;
}
