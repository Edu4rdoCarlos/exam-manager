import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { SubmitStudentAnswers } from '../../../application/student-answer/services/SubmitStudentAnswers';
import { HttpResponse, HttpPaginatedResponseBody } from '../../../../../shared/utils/HttpResponse';
import { SubmitStudentAnswersDto } from './dto/SubmitStudentAnswersDto';
import { SubmitStudentAnswersDocs } from './docs/student-answers.docs';

@ApiBearerAuth()
@ApiTags('student-answers')
@UseGuards(JwtAuthGuard)
@Controller('student-answers')
export class StudentAnswerController {
  constructor(private readonly submitStudentAnswers: SubmitStudentAnswers) {}

  @Post()
  @SubmitStudentAnswersDocs()
  async submit(@Body() dto: SubmitStudentAnswersDto): Promise<HttpPaginatedResponseBody<unknown>> {
    const result = await this.submitStudentAnswers.execute(dto);
    if (!result.ok) throw new Error('Unexpected failure');
    const items = result.value as unknown[];
    return HttpResponse.paginated(items, {
      page: 1,
      limit: items.length,
      total: items.length,
      totalPages: 1,
    });
  }
}
