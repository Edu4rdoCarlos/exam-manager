import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateAnswerKeys } from '../../application/services/CreateAnswerKeys';
import { GetAnswerKeys } from '../../application/services/GetAnswerKeys';
import { CreateAnswerKeysDto } from './dto/CreateAnswerKeysDto';

@ApiBearerAuth()
@ApiTags('answer-keys')
@UseGuards(JwtAuthGuard)
@Controller('answer-keys')
export class AnswerKeyController {
  constructor(
    private readonly createAnswerKeys: CreateAnswerKeys,
    private readonly getAnswerKeys: GetAnswerKeys,
  ) {}

  @Post()
  async create(@Body() dto: CreateAnswerKeysDto): Promise<unknown> {
    const result = await this.createAnswerKeys.execute(dto);
    if (!result.ok) throw new Error('Unexpected failure');
    return result.value;
  }

  @Get('exam-version/:examVersionId')
  async findByExamVersion(@Param('examVersionId') examVersionId: string): Promise<unknown> {
    return this.getAnswerKeys.execute(examVersionId);
  }
}
