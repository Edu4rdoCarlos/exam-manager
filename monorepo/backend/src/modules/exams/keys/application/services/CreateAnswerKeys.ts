import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AnswerKey } from '../../domain/AnswerKey';
import { AnswerKeyRepository, ANSWER_KEY_REPOSITORY } from '../ports/AnswerKeyRepository';
import { Result, success } from '../../../../../shared/result';

export interface CreateAnswerKeysInput {
  readonly examVersionId: string;
  readonly keys: Array<{
    readonly examVersionQuestionId: string;
    readonly correctAnswer: string;
  }>;
}

@Injectable()
export class CreateAnswerKeys {
  constructor(
    @Inject(ANSWER_KEY_REPOSITORY)
    private readonly answerKeyRepository: AnswerKeyRepository,
  ) {}

  async execute(input: CreateAnswerKeysInput): Promise<Result<AnswerKey[], never>> {
    const keys: AnswerKey[] = input.keys.map((k) => ({
      id: randomUUID(),
      examVersionId: input.examVersionId,
      examVersionQuestionId: k.examVersionQuestionId,
      correctAnswer: k.correctAnswer,
    }));

    const saved = await this.answerKeyRepository.saveMany(keys);
    return success(saved);
  }
}
