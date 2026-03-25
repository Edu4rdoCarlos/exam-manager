import { Inject, Injectable } from '@nestjs/common';
import { Question } from '../../../domain/question/Question';
import { QuestionRepository, UpdateQuestionData, QUESTION_REPOSITORY } from '../ports/QuestionRepository';
import { QuestionNotFound } from '../../../domain/question/errors/QuestionNotFound';
import { Result, success, failure } from '../../../../../shared/result';

export interface UpdateQuestionInput {
  readonly statement?: string;
  readonly alternatives?: Array<{
    readonly description: string;
    readonly isCorrect: boolean;
  }>;
}

@Injectable()
export class UpdateQuestion {
  constructor(
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(id: string, input: UpdateQuestionInput): Promise<Result<Question, QuestionNotFound>> {
    const data: UpdateQuestionData = {
      statement: input.statement,
      alternatives: input.alternatives,
    };
    const updated = await this.questionRepository.update(id, data);
    if (!updated) return failure(new QuestionNotFound(id));
    return success(updated);
  }
}
