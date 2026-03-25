import { Body, Controller, Get, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateExamVersion } from '../../application/services/CreateExamVersion';
import { GetExamVersion } from '../../application/services/GetExamVersion';
import { CreateExamVersionDto } from './dto/CreateExamVersionDto';
import { CreateExamVersionDocs, FindExamVersionsByExamDocs, GetExamVersionDocs } from './docs/exam-versions.docs';

@ApiBearerAuth()
@ApiTags('exam-versions')
@UseGuards(JwtAuthGuard)
@Controller('exam-versions')
export class ExamVersionController {
  constructor(
    private readonly createExamVersion: CreateExamVersion,
    private readonly getExamVersion: GetExamVersion,
  ) {}

  @Post()
  @CreateExamVersionDocs()
  async create(@Body() dto: CreateExamVersionDto): Promise<unknown> {
    const result = await this.createExamVersion.execute(dto);
    if (!result.ok) throw new NotFoundException(result.error);
    return result.value;
  }

  @Get()
  @FindExamVersionsByExamDocs()
  async findByExam(@Query('examId') examId: string): Promise<unknown> {
    return this.getExamVersion.findByExamId(examId);
  }

  @Get(':id')
  @GetExamVersionDocs()
  async findOne(@Param('id') id: string): Promise<unknown> {
    const result = await this.getExamVersion.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return result.value;
  }
}
