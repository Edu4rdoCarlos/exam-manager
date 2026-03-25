import { Body, ConflictException, Controller, Get, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, JwtPayload } from '../../../auth/infrastructure/guards/JwtAuthGuard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/CurrentUser';
import { CreateUser } from '../../application/services/CreateUser';
import { GetUser } from '../../application/services/GetUser';
import { GetExamsByTeacher } from '../../../exams/application/exam/services/GetExamsByTeacher';
import { HttpResponse, HttpResponseBody } from '../../../../shared/utils/HttpResponse';
import { CreateUserDto } from './dto/CreateUserDto';
import { UserResponseDto } from './dto/UserResponseDto';
import { UserMeResponseDto, UserMeExamDto } from './dto/UserMeResponseDto';
import { CreateUserDocs, GetUserDocs } from './docs/users.docs';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUser,
    private readonly getUser: GetUser,
    private readonly getExamsByTeacher: GetExamsByTeacher,
  ) {}

  @Post()
  @CreateUserDocs()
  async create(@Body() dto: CreateUserDto): Promise<HttpResponseBody<UserResponseDto>> {
    const result = await this.createUser.execute({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });
    if (!result.ok) throw new ConflictException(result.error.type);
    const u = result.value;
    return HttpResponse.of(new UserResponseDto(u.id, u.name, u.email, u.createdAt ?? null));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @GetUserDocs()
  async findMe(@CurrentUser() currentUser: JwtPayload): Promise<HttpResponseBody<UserMeResponseDto>> {
    const result = await this.getUser.execute(currentUser.sub);
    if (!result.ok) throw new NotFoundException(result.error);

    const u = result.value;
    const exams = await this.getExamsByTeacher.execute(u.id);
    const examDtos = exams.map(
      (e) => new UserMeExamDto(e.id, e.title, e.subject, e.examDate, e.answerFormat, e.createdAt ?? null),
    );

    return HttpResponse.of(new UserMeResponseDto(u.id, u.name, u.email, u.createdAt ?? null, examDtos));
  }
}
