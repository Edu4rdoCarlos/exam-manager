import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateCorrection } from '../../../application/corrections/services/CreateCorrection';
import { GetCorrection } from '../../../application/corrections/services/GetCorrection';
import { GetCorrectionsByExam } from '../../../application/corrections/services/GetCorrectionsByExam';
import { ApplyCorrection } from '../../../application/corrections/services/ApplyCorrection';
import { CorrectExamFromCsv } from '../../../application/corrections/services/CorrectExamFromCsv';
import { HttpResponse, HttpResponseBody } from '../../../../../shared/utils/HttpResponse';
import { CorrectionResponseDto, ApplyCorrectionResponseDto } from './dto/CorrectionResponseDto';
import { CreateCorrectionDto } from './dto/CreateCorrectionDto';
import {
  CreateCorrectionDocs,
  GetCorrectionDocs,
  GetCorrectionsByExamDocs,
  ApplyCorrectionDocs,
  ApplyFromCsvDocs,
} from './docs/corrections.docs';

@ApiBearerAuth()
@ApiTags('corrections')
@UseGuards(JwtAuthGuard)
@Controller('corrections')
export class CorrectionController {
  constructor(
    private readonly createCorrection: CreateCorrection,
    private readonly getCorrection: GetCorrection,
    private readonly getCorrectionsByExam: GetCorrectionsByExam,
    private readonly applyCorrection: ApplyCorrection,
    private readonly correctExamFromCsv: CorrectExamFromCsv,
  ) {}

  @Post()
  @CreateCorrectionDocs()
  async create(@Body() dto: CreateCorrectionDto): Promise<HttpResponseBody<CorrectionResponseDto>> {
    const result = await this.createCorrection.execute(dto);
    if (!result.ok) throw new NotFoundException(result.error);
    const c = result.value;
    return HttpResponse.of(new CorrectionResponseDto(c.id, c.examId, c.correctionMode, c.createdAt ?? null));
  }

  @Get()
  @GetCorrectionsByExamDocs()
  async findByExam(@Query('examId') examId: string): Promise<HttpResponseBody<CorrectionResponseDto[]>> {
    const corrections = await this.getCorrectionsByExam.execute(examId);
    return HttpResponse.of(corrections.map((c) => new CorrectionResponseDto(c.id, c.examId, c.correctionMode, c.createdAt ?? null)));
  }

  @Get(':id')
  @GetCorrectionDocs()
  async findOne(@Param('id') id: string): Promise<HttpResponseBody<CorrectionResponseDto>> {
    const result = await this.getCorrection.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    const c = result.value;
    return HttpResponse.of(new CorrectionResponseDto(c.id, c.examId, c.correctionMode, c.createdAt ?? null));
  }

  @Post(':id/apply')
  @ApplyCorrectionDocs()
  async apply(@Param('id') id: string): Promise<HttpResponseBody<ApplyCorrectionResponseDto>> {
    const result = await this.applyCorrection.execute({ correctionId: id });
    if (!result.ok) throw new NotFoundException(result.error);
    return HttpResponse.of(new ApplyCorrectionResponseDto(result.value.gradesCount));
  }

  @Post(':id/apply-from-csv')
  @ApplyFromCsvDocs()
  @UseInterceptors(FileInterceptor('file'))
  async applyFromCsv(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<HttpResponseBody<ApplyCorrectionResponseDto>> {
    const csvContent = file.buffer.toString('utf-8');
    const result = await this.correctExamFromCsv.execute({ correctionId: id, csvContent });
    if (!result.ok) throw new NotFoundException(result.error);
    return HttpResponse.of(new ApplyCorrectionResponseDto(result.value.gradesCount));
  }
}
