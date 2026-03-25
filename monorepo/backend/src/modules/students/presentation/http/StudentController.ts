import { Body, ConflictException, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateStudent } from '../../application/services/CreateStudent';
import { GetStudent } from '../../application/services/GetStudent';
import { HttpResponse, HttpResponseBody } from '../../../../shared/utils/HttpResponse';
import { CreateStudentDto } from './dto/CreateStudentDto';
import { CreateStudentDocs, GetStudentDocs } from './docs/students.docs';

@ApiTags('students')
@Controller('students')
export class StudentController {
  constructor(
    private readonly createStudent: CreateStudent,
    private readonly getStudent: GetStudent,
  ) {}

  @Post()
  @CreateStudentDocs()
  async create(@Body() dto: CreateStudentDto): Promise<HttpResponseBody<unknown>> {
    const result = await this.createStudent.execute(dto);
    if (!result.ok) throw new ConflictException(result.error.type);
    return HttpResponse.of(result.value);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @GetStudentDocs()
  async findOne(@Param('id') id: string): Promise<HttpResponseBody<unknown>> {
    const result = await this.getStudent.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return HttpResponse.of(result.value);
  }
}
