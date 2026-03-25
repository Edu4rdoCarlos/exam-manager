import { IsInt, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExamVersionDto {
  @ApiProperty()
  @IsUUID()
  examId!: string;

  @ApiProperty()
  @IsInt()
  versionNumber!: number;
}
