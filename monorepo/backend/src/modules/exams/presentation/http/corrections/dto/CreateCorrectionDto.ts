import { IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCorrectionDto {
  @ApiProperty()
  @IsUUID()
  examId!: string;

  @ApiProperty({ enum: ['strict', 'lenient'] })
  @IsEnum(['strict', 'lenient'])
  correctionMode!: 'strict' | 'lenient';
}
