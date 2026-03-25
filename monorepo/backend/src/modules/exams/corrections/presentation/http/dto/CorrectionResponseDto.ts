import { ApiProperty } from '@nestjs/swagger';

export class CorrectionResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  examId!: string;

  @ApiProperty({ enum: ['strict', 'lenient'], example: 'strict' })
  correctionMode!: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  createdAt!: Date | null;
}

export class ApplyCorrectionResponseDto {
  @ApiProperty({ example: 30, description: 'Number of grades generated' })
  gradesCount!: number;
}
