import { Body, ConflictException, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateUser } from '../../application/services/CreateUser';
import { GetUser } from '../../application/services/GetUser';
import { HttpResponse, HttpResponseBody } from '../../../../shared/utils/HttpResponse';
import { CreateUserDto } from './dto/CreateUserDto';
import { CreateUserDocs, GetUserDocs } from './docs/users.docs';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUser,
    private readonly getUser: GetUser,
  ) {}

  @Post()
  @CreateUserDocs()
  async create(@Body() dto: CreateUserDto): Promise<HttpResponseBody<unknown>> {
    const result = await this.createUser.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });
    if (!result.ok) throw new ConflictException(result.error.type);
    return HttpResponse.of(result.value);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @GetUserDocs()
  async findOne(@Param('id') id: string): Promise<HttpResponseBody<unknown>> {
    const result = await this.getUser.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return HttpResponse.of(result.value);
  }
}
