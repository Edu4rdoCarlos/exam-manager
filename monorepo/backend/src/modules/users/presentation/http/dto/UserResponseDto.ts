import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  readonly id: string;

  @ApiProperty({ example: 'Prof. Silva' })
  readonly name: string;

  @ApiProperty({ example: 'silva@ufpe.br' })
  readonly email: string;

  @ApiProperty({ example: '2026-01-15T10:30:00.000Z', nullable: true })
  readonly createdAt: Date | null;

  constructor(id: string, name: string, email: string, createdAt: Date | null) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.createdAt = createdAt;
  }
}
