import { Inject, Injectable } from '@nestjs/common';
import { Question } from '../../../domain/question/Question';
import { QuestionRepository, QUESTION_REPOSITORY } from '../ports/QuestionRepository';

@Injectable()
export class GetAllQuestions {
  constructor(
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(): Promise<Question[]> {
    return this.questionRepository.findAll();
  }
}
