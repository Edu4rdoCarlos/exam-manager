import { ApiProperty } from '@nestjs/swagger';

export class CorrectionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly examId: string;

  @ApiProperty({ enum: ['strict', 'lenient'], example: 'strict' })
  readonly correctionMode: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  readonly createdAt: Date | null;

  constructor(id: string, examId: string, correctionMode: string, createdAt: Date | null) {
    this.id = id;
    this.examId = examId;
    this.correctionMode = correctionMode;
    this.createdAt = createdAt;
  }
}

export class ApplyCorrectionResponseDto {
  @ApiProperty({ example: 30, description: 'Number of grades generated' })
  readonly gradesCount: number;

  constructor(gradesCount: number) {
    this.gradesCount = gradesCount;
  }
}
