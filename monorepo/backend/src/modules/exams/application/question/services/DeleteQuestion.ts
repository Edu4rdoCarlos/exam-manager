import { Inject, Injectable } from '@nestjs/common';
import { QuestionRepository, QUESTION_REPOSITORY } from '../ports/QuestionRepository';
import { QuestionNotFound } from '../../../domain/question/errors/QuestionNotFound';
import { QuestionInUse } from '../../../domain/question/errors/QuestionInUse';
import { Result, success, failure } from '../../../../../shared/result';

@Injectable()
export class DeleteQuestion {
  constructor(
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: QuestionRepository,
  ) {}

  async execute(id: string): Promise<Result<void, QuestionNotFound | QuestionInUse>> {
    const existing = await this.questionRepository.findById(id);
    if (!existing) return failure(new QuestionNotFound(id));

    const inUse = await this.questionRepository.isUsedInExam(id);
    if (inUse) return failure(new QuestionInUse(id));

    await this.questionRepository.delete(id);
    return success(undefined);
  }
}
