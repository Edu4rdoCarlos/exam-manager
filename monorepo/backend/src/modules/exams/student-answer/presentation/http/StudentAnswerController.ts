import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { SubmitStudentAnswers } from '../../application/services/SubmitStudentAnswers';
import { SubmitStudentAnswersDto } from './dto/SubmitStudentAnswersDto';

@ApiBearerAuth()
@ApiTags('student-answers')
@UseGuards(JwtAuthGuard)
@Controller('student-answers')
export class StudentAnswerController {
  constructor(private readonly submitStudentAnswers: SubmitStudentAnswers) {}

  @Post()
  async submit(@Body() dto: SubmitStudentAnswersDto): Promise<unknown> {
    const result = await this.submitStudentAnswers.execute(dto);
    if (!result.ok) throw new Error('Unexpected failure');
    return result.value;
  }
}
