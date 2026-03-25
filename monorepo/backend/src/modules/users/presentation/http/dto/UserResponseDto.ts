import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Prof. Silva' })
  name!: string;

  @ApiProperty({ example: 'silva@ufpe.br' })
  email!: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  createdAt!: Date | null;
}
