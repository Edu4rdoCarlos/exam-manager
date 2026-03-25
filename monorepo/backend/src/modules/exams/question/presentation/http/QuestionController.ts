import { Body, Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/guards/JwtAuthGuard';
import { CreateQuestion } from '../../application/services/CreateQuestion';
import { GetQuestion } from '../../application/services/GetQuestion';
import { GetAllQuestions } from '../../application/services/GetAllQuestions';
import { CreateQuestionDto } from './dto/CreateQuestionDto';

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
  async create(@Body() dto: CreateQuestionDto): Promise<unknown> {
    const result = await this.createQuestion.execute(dto);
    if (!result.ok) throw new Error('Unexpected failure');
    return result.value;
  }

  @Get()
  async findAll(): Promise<unknown> {
    return this.getAllQuestions.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<unknown> {
    const result = await this.getQuestion.execute(id);
    if (!result.ok) throw new NotFoundException(result.error);
    return result.value;
  }
}
