import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateAnswerKeys } from '../../application/services/CreateAnswerKeys';
import { GetAnswerKeys } from '../../application/services/GetAnswerKeys';
import { HttpResponse, HttpPaginatedResponseBody } from '../../../../../shared/utils/HttpResponse';
import { CreateAnswerKeysDto } from './dto/CreateAnswerKeysDto';
import { CreateAnswerKeysDocs, GetAnswerKeysDocs } from './docs/answer-keys.docs';

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
  @CreateAnswerKeysDocs()
  async create(@Body() dto: CreateAnswerKeysDto): Promise<HttpPaginatedResponseBody<unknown>> {
    const result = await this.createAnswerKeys.execute(dto);
    if (!result.ok) throw new Error('Unexpected failure');
    const items = result.value as unknown[];
    return HttpResponse.paginated(items, {
      total: items.length,
      page: 1,
      limit: items.length,
      totalPages: 1,
    });
  }

  @Get('exam-version/:examVersionId')
  @GetAnswerKeysDocs()
  async findByExamVersion(@Param('examVersionId') examVersionId: string): Promise<HttpPaginatedResponseBody<unknown>> {
    const items = (await this.getAnswerKeys.execute(examVersionId)) as unknown[];
    return HttpResponse.paginated(items, {
      total: items.length,
      page: 1,
      limit: items.length,
      totalPages: 1,
    });
  }
}
