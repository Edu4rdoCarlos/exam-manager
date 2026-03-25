import { Body, ConflictException, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateExam } from '../../application/services/CreateExam';
import { GetExam } from '../../application/services/GetExam';
import { UpdateExam } from '../../application/services/UpdateExam';
import { DeleteExam } from '../../application/services/DeleteExam';
import { HttpResponse, HttpResponseBody } from '../../../../../shared/utils/HttpResponse';
import { CreateExamDto } from './dto/CreateExamDto';
import { UpdateExamDto } from './dto/UpdateExamDto';
import { CreateExamDocs, DeleteExamDocs, GetExamDocs, UpdateExamDocs } from './docs/exams.docs';

@ApiBearerAuth()
@ApiTags('exams')
@UseGuards(JwtAuthGuard)
@Controller('exams')
export class ExamController {
  constructor(
    private readonly createExam: CreateExam,
    private readonly getExam: GetExam,
    private readonly updateExam: UpdateExam,
    private readonly deleteExam: DeleteExam,
  ) {}

  @Post()
  @CreateExamDocs()
  async create(@Body() dto: CreateExamDto): Promise<HttpResponseBody<unknown>> {
    const result = await this.createExam.execute({
      title: dto.title,
      subject: dto.subject,
      teacherId: dto.teacherId,
      examDate: dto.examDate ? new Date(dto.examDate) : null,
      answerFormat: dto.answerFormat,
      questionIds: dto.questionIds,
    });
    if (!result.ok) throw new Error('Unexpected failure');
    return HttpResponse.of(result.value);
  }

  @Get(':id')
  @GetExamDocs()
  async findOne(@Param('id') id: string): Promise<HttpResponseBody<unknown>> {
    const result = await this.getExam.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return HttpResponse.of(result.value);
  }

  @Patch(':id')
  @UpdateExamDocs()
  async update(@Param('id') id: string, @Body() dto: UpdateExamDto): Promise<HttpResponseBody<unknown>> {
    const result = await this.updateExam.execute(id, {
      title: dto.title,
      subject: dto.subject,
      examDate: dto.examDate !== undefined ? (dto.examDate ? new Date(dto.examDate) : null) : undefined,
      answerFormat: dto.answerFormat,
      questionIds: dto.questionIds,
    });
    if (!result.ok) throw new NotFoundException(result.error);
    return HttpResponse.of(result.value);
  }

  @Delete(':id')
  @HttpCode(204)
  @DeleteExamDocs()
  async remove(@Param('id') id: string): Promise<void> {
    const result = await this.deleteExam.execute(id);
    if (!result.ok) {
      if (result.error.type === 'ExamNotFound') throw new NotFoundException(result.error);
      throw new ConflictException(result.error);
    }
  }
}
