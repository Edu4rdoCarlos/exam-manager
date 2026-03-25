import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { GetGrades } from '../../application/services/GetGrades';
import { HttpResponse, HttpPaginatedResponseBody } from '../../../../../shared/utils/HttpResponse';
import { GetGradesByExamVersionDocs, GetGradesByCorrectionDocs } from './docs/grades.docs';

@ApiBearerAuth()
@ApiTags('grades')
@UseGuards(JwtAuthGuard)
@Controller('grades')
export class GradeController {
  constructor(private readonly getGrades: GetGrades) {}

  @Get('exam-version/:examVersionId')
  @GetGradesByExamVersionDocs()
  async findByExamVersion(@Param('examVersionId') examVersionId: string): Promise<HttpPaginatedResponseBody<unknown>> {
    const items = (await this.getGrades.findByExamVersion(examVersionId)) as unknown[];
    return HttpResponse.paginated(items, {
      total: items.length,
      page: 1,
      limit: items.length,
      totalPages: 1,
    });
  }

  @Get('correction/:correctionId')
  @GetGradesByCorrectionDocs()
  async findByCorrection(@Param('correctionId') correctionId: string): Promise<HttpPaginatedResponseBody<unknown>> {
    const items = (await this.getGrades.findByCorrection(correctionId)) as unknown[];
    return HttpResponse.paginated(items, {
      total: items.length,
      page: 1,
      limit: items.length,
      totalPages: 1,
    });
  }
}
