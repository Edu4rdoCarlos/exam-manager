import { Body, ConflictException, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateStudent } from '../../application/services/CreateStudent';
import { GetStudent } from '../../application/services/GetStudent';
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
  async create(@Body() dto: CreateStudentDto): Promise<unknown> {
    const result = await this.createStudent.execute(dto);
    if (!result.ok) throw new ConflictException(result.error.type);
    return result.value;
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @GetStudentDocs()
  async findOne(@Param('id') id: string): Promise<unknown> {
    const result = await this.getStudent.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return result.value;
  }
}
