import { Body, Controller, Get, NotFoundException, Param, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateAnswerKeys } from '../../../application/keys/services/CreateAnswerKeys';
import { GetAnswerKeys } from '../../../application/keys/services/GetAnswerKeys';
import { ExportAnswerKeyCsv } from '../../../application/keys/services/ExportAnswerKeyCsv';
import { HttpResponse, HttpPaginatedResponseBody } from '../../../../../shared/utils/HttpResponse';
import { CreateAnswerKeysDto } from './dto/CreateAnswerKeysDto';
import { CreateAnswerKeysDocs, ExportAnswerKeysCsvDocs, GetAnswerKeysDocs } from './docs/answer-keys.docs';

@ApiBearerAuth()
@ApiTags('answer-keys')
@UseGuards(JwtAuthGuard)
@Controller('answer-keys')
export class AnswerKeyController {
  constructor(
    private readonly createAnswerKeys: CreateAnswerKeys,
    private readonly getAnswerKeys: GetAnswerKeys,
    private readonly exportAnswerKeyCsv: ExportAnswerKeyCsv,
  ) {}

  @Post()
  @CreateAnswerKeysDocs()
  async create(@Body() dto: CreateAnswerKeysDto): Promise<HttpPaginatedResponseBody<unknown>> {
    const result = await this.createAnswerKeys.execute(dto);
    if (!result.ok) throw new Error('Unexpected failure');
    const items = result.value as unknown[];
    return HttpResponse.paginated(items, {
      page: 1,
      limit: items.length,
      total: items.length,
      totalPages: 1,
    });
  }

  @Get('exam-version/:examVersionId')
  @GetAnswerKeysDocs()
  async findByExamVersion(@Param('examVersionId') examVersionId: string): Promise<HttpPaginatedResponseBody<unknown>> {
    const items = (await this.getAnswerKeys.execute(examVersionId)) as unknown[];
    return HttpResponse.paginated(items, {
      page: 1,
      limit: items.length,
      total: items.length,
      totalPages: 1,
    });
  }

  @Get('exam-version/:examVersionId/csv')
  @ExportAnswerKeysCsvDocs()
  async exportCsv(@Param('examVersionId') examVersionId: string, @Res() res: Response): Promise<void> {
    const result = await this.exportAnswerKeyCsv.execute(examVersionId);
    if (!result.ok) throw new NotFoundException(result.error);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="answer-key-${examVersionId}.csv"`,
    });
    res.send(result.value);
  }
}
