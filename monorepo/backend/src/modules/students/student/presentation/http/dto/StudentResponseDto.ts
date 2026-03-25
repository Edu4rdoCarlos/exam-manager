import { ApiProperty } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'João da Silva' })
  name!: string;

  @ApiProperty({ example: '123.456.789-00' })
  cpf!: string;
}
