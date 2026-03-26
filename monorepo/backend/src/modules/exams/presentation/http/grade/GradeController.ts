import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { GetGrades } from '../../../application/grade/services/GetGrades';
import { GetGradeReport } from '../../../application/grade/services/GetGradeReport';
import { HttpResponse, HttpPaginatedResponseBody } from '../../../../../shared/utils/HttpResponse';
import { GradeResponseDto } from './dto/GradeResponseDto';
import {
  GradeReportResponseDto,
  GradeReportStudentDto,
  GradeReportExamDto,
  GradeReportExamVersionDto,
} from './dto/GradeReportResponseDto';
import { GetGradesByExamVersionDocs, GetGradesByCorrectionDocs, GetGradeReportByCorrectionDocs } from './docs/grades.docs';
import { Grade } from '../../../domain/grade/Grade';
import { GradeReport } from '../../../domain/grade/GradeReport';

@ApiBearerAuth()
@ApiTags('grades')
@UseGuards(JwtAuthGuard)
@Controller('grades')
export class GradeController {
  constructor(
    private readonly getGrades: GetGrades,
    private readonly getGradeReport: GetGradeReport,
  ) {}

  @Get('exam-version/:examVersionId')
  @GetGradesByExamVersionDocs()
  async findByExamVersion(@Param('examVersionId') examVersionId: string): Promise<HttpPaginatedResponseBody<GradeResponseDto>> {
    const grades = await this.getGrades.findByExamVersion(examVersionId);
    const items = grades.map((g: Grade) => new GradeResponseDto(g.id, g.studentId, g.examVersionId, g.correctionId, g.score));
    return HttpResponse.paginated(items, { page: 1, limit: items.length, total: items.length, totalPages: 1 });
  }

  @Get('correction/:correctionId')
  @GetGradesByCorrectionDocs()
  async findByCorrection(@Param('correctionId') correctionId: string): Promise<HttpPaginatedResponseBody<GradeResponseDto>> {
    const grades = await this.getGrades.findByCorrection(correctionId);
    const items = grades.map((g: Grade) => new GradeResponseDto(g.id, g.studentId, g.examVersionId, g.correctionId, g.score));
    return HttpResponse.paginated(items, { page: 1, limit: items.length, total: items.length, totalPages: 1 });
  }

  @Get('report/correction/:correctionId')
  @GetGradeReportByCorrectionDocs()
  async getReport(@Param('correctionId') correctionId: string): Promise<HttpPaginatedResponseBody<GradeReportResponseDto>> {
    const reports = await this.getGradeReport.findByCorrection(correctionId);
    const items = reports.map(
      (r: GradeReport) =>
        new GradeReportResponseDto(
          r.gradeId,
          r.score,
          r.correctionId,
          new GradeReportStudentDto(r.student.id, r.student.name, r.student.cpf),
          new GradeReportExamDto(r.exam.id, r.exam.title, r.exam.subject),
          new GradeReportExamVersionDto(r.examVersion.id, r.examVersion.versionNumber),
        ),
    );
    return HttpResponse.paginated(items, { page: 1, limit: items.length, total: items.length, totalPages: 1 });
  }
}
