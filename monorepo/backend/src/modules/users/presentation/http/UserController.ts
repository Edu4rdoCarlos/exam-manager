import { Body, ConflictException, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateUser } from '../../application/services/CreateUser';
import { GetUser } from '../../application/services/GetUser';
import { CreateUserDto } from './dto/CreateUserDto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUser,
    private readonly getUser: GetUser,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<unknown> {
    const result = await this.createUser.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });
    if (!result.ok) throw new ConflictException(result.error.type);
    return result.value;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<unknown> {
    const result = await this.getUser.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return result.value;
  }
}
