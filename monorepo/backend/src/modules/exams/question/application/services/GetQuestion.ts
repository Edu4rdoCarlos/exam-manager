import { Inject, Injectable } from '@nestjs/common';
import { Question } from '../../domain/Question';
import { QuestionRepository, QUESTION_REPOSITORY } from '../ports/QuestionRepository';
import { QuestionNotFound } from '../../domain/errors/QuestionNotFound';
import { Result, success, failure } from '../../../../../shared/result';

@Injectable()
export class GetQuestion {
  constructor(
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(id: string): Promise<Result<Question, QuestionNotFound>> {
    const question = await this.questionRepository.findById(id);
    if (!question) return failure(new QuestionNotFound(id));
    return success(question);
  }
}
