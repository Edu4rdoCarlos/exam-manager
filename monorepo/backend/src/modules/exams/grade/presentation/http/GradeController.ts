import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { GetGrades } from '../../application/services/GetGrades';

@ApiBearerAuth()
@ApiTags('grades')
@UseGuards(JwtAuthGuard)
@Controller('grades')
export class GradeController {
  constructor(private readonly getGrades: GetGrades) {}

  @Get('exam-version/:examVersionId')
  async findByExamVersion(@Param('examVersionId') examVersionId: string): Promise<unknown> {
    return this.getGrades.findByExamVersion(examVersionId);
  }

  @Get('correction/:correctionId')
  async findByCorrection(@Param('correctionId') correctionId: string): Promise<unknown> {
    return this.getGrades.findByCorrection(correctionId);
  }
}
