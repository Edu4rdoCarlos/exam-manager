import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateExam } from '../../application/services/CreateExam';
import { GetExam } from '../../application/services/GetExam';
import { CreateExamDto } from './dto/CreateExamDto';
import { CreateExamDocs, GetExamDocs } from './docs/exams.docs';

@ApiBearerAuth()
@ApiTags('exams')
@UseGuards(JwtAuthGuard)
@Controller('exams')
export class ExamController {
  constructor(
    private readonly createExam: CreateExam,
    private readonly getExam: GetExam,
  ) {}

  @Post()
  @CreateExamDocs()
  async create(@Body() dto: CreateExamDto): Promise<unknown> {
    const result = await this.createExam.execute({
      title: dto.title,
      subject: dto.subject,
      teacherId: dto.teacherId,
      examDate: dto.examDate ? new Date(dto.examDate) : null,
      answerFormat: dto.answerFormat,
      questionIds: dto.questionIds,
    });
    if (!result.ok) throw new Error('Unexpected failure');
    return result.value;
  }

  @Get(':id')
  @GetExamDocs()
  async findOne(@Param('id') id: string): Promise<unknown> {
    const result = await this.getExam.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return result.value;
  }
}
