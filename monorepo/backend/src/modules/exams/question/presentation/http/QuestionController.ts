import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateQuestion } from '../../application/services/CreateQuestion';
import { GetQuestion } from '../../application/services/GetQuestion';
import { GetAllQuestions } from '../../application/services/GetAllQuestions';
import { HttpResponse, HttpResponseBody, HttpPaginatedResponseBody } from '../../../../../shared/utils/HttpResponse';
import { CreateQuestionDto } from './dto/CreateQuestionDto';
import { CreateQuestionDocs, GetAllQuestionsDocs, GetQuestionDocs } from './docs/questions.docs';

@ApiBearerAuth()
@ApiTags('questions')
@UseGuards(JwtAuthGuard)
@Controller('questions')
export class QuestionController {
  constructor(
    private readonly createQuestion: CreateQuestion,
    private readonly getQuestion: GetQuestion,
    private readonly getAllQuestions: GetAllQuestions,
  ) {}

  @Post()
  @CreateQuestionDocs()
  async create(@Body() dto: CreateQuestionDto): Promise<HttpResponseBody<unknown>> {
    const result = await this.createQuestion.execute(dto);
    if (!result.ok) throw new Error('Unexpected failure');
    return HttpResponse.of(result.value);
  }

  @Get()
  @GetAllQuestionsDocs()
  async findAll(): Promise<HttpPaginatedResponseBody<unknown>> {
    const items = (await this.getAllQuestions.execute()) as unknown[];
    return HttpResponse.paginated(items, {
      total: items.length,
      page: 1,
      limit: items.length,
      totalPages: 1,
    });
  }

  @Get(':id')
  @GetQuestionDocs()
  async findOne(@Param('id') id: string): Promise<HttpResponseBody<unknown>> {
    const result = await this.getQuestion.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return HttpResponse.of(result.value);
  }
}
