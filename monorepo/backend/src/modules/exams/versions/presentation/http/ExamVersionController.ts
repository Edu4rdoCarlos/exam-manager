import { Body, Controller, Get, NotFoundException, Param, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateExamVersion } from '../../application/services/CreateExamVersion';
import { GetExamVersion } from '../../application/services/GetExamVersion';
import { GenerateExamVersionPdf } from '../../application/services/GenerateExamVersionPdf';
import { HttpResponse, HttpResponseBody, HttpPaginatedResponseBody } from '../../../../../shared/utils/HttpResponse';
import { CreateExamVersionDto } from './dto/CreateExamVersionDto';
import { CreateExamVersionDocs, ExportExamVersionPdfDocs, FindExamVersionsByExamDocs, GetExamVersionDocs } from './docs/exam-versions.docs';

@ApiBearerAuth()
@ApiTags('exam-versions')
@UseGuards(JwtAuthGuard)
@Controller('exam-versions')
export class ExamVersionController {
  constructor(
    private readonly createExamVersion: CreateExamVersion,
    private readonly getExamVersion: GetExamVersion,
    private readonly generateExamVersionPdf: GenerateExamVersionPdf,
  ) {}

  @Post()
  @CreateExamVersionDocs()
  async create(@Body() dto: CreateExamVersionDto): Promise<HttpResponseBody<unknown>> {
    const result = await this.createExamVersion.execute(dto);
    if (!result.ok) throw new NotFoundException(result.error);
    return HttpResponse.of(result.value);
  }

  @Get()
  @FindExamVersionsByExamDocs()
  async findByExam(@Query('examId') examId: string): Promise<HttpPaginatedResponseBody<unknown>> {
    const items = (await this.getExamVersion.findByExamId(examId)) as unknown[];
    return HttpResponse.paginated(items, {
      total: items.length,
      page: 1,
      limit: items.length,
      totalPages: 1,
    });
  }

  @Get(':id')
  @GetExamVersionDocs()
  async findOne(@Param('id') id: string): Promise<HttpResponseBody<unknown>> {
    const result = await this.getExamVersion.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return HttpResponse.of(result.value);
  }

  @Get(':id/pdf')
  @ExportExamVersionPdfDocs()
  async exportPdf(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const result = await this.generateExamVersionPdf.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="exam-version-${id}.pdf"`,
      'Content-Length': result.value.length,
    });
    res.end(result.value);
  }
}
