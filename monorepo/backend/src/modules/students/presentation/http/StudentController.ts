import { Body, ConflictException, Controller, Get, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateStudent } from '../../application/services/CreateStudent';
import { GetStudent } from '../../application/services/GetStudent';
import { ListStudents } from '../../application/services/ListStudents';
import { HttpResponse, HttpPaginatedResponseBody, HttpResponseBody } from '../../../../shared/utils/HttpResponse';
import { CreateStudentDto } from './dto/CreateStudentDto';
import { CreateStudentDocs, GetStudentDocs } from './docs/students.docs';

@ApiBearerAuth()
@ApiTags('students')
@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentController {
  constructor(
    private readonly createStudent: CreateStudent,
    private readonly getStudent: GetStudent,
    private readonly listStudents: ListStudents,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('perPage') perPage = '20',
  ): Promise<HttpPaginatedResponseBody<unknown>> {
    const { students, totalItems, totalPages } = await this.listStudents.execute(Number(page), Number(perPage));
    return HttpResponse.paginated(students, { page: Number(page), perPage: Number(perPage), totalItems, totalPages });
  }

  @Post()
  @CreateStudentDocs()
  async create(@Body() dto: CreateStudentDto): Promise<HttpResponseBody<unknown>> {
    const result = await this.createStudent.execute(dto);
    if (!result.ok) throw new ConflictException(result.error.type);
    return HttpResponse.of(result.value);
  }

  @Get(':id')
  @GetStudentDocs()
  async findOne(@Param('id') id: string): Promise<HttpResponseBody<unknown>> {
    const result = await this.getStudent.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return HttpResponse.of(result.value);
  }
}
