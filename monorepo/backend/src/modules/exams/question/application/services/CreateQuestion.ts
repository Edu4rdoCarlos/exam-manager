import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Question } from '../../domain/Question';
import { QuestionRepository, QUESTION_REPOSITORY } from '../ports/QuestionRepository';
import { Result, success } from '../../../../../shared/result';

export interface CreateQuestionInput {
  readonly statement: string;
  readonly alternatives: Array<{
    readonly description: string;
    readonly isCorrect: boolean;
  }>;
}

@Injectable()
export class CreateQuestion {
  constructor(
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(input: CreateQuestionInput): Promise<Result<Question, never>> {
    const saved = await this.questionRepository.save({
      id: randomUUID(),
      statement: input.statement,
      alternatives: input.alternatives.map((a) => ({
        id: randomUUID(),
        description: a.description,
        isCorrect: a.isCorrect,
      })),
    });
    return success(saved);
  }
}
