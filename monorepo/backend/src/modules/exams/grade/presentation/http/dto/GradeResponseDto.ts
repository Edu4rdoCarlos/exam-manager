import { ApiProperty } from '@nestjs/swagger';

export class GradeResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly studentId: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly examVersionId: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly correctionId: string;

  @ApiProperty({ example: 0.85, description: 'Score from 0.0 to 1.0' })
  readonly score: number;

  constructor(id: string, studentId: string, examVersionId: string, correctionId: string, score: number) {
    this.id = id;
    this.studentId = studentId;
    this.examVersionId = examVersionId;
    this.correctionId = correctionId;
    this.score = score;
  }
}
