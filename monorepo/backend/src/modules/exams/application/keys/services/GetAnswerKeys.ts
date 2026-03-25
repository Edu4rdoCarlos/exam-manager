import { Inject, Injectable } from '@nestjs/common';
import { AnswerKey } from '../../../domain/keys/AnswerKey';
import { AnswerKeyRepository, ANSWER_KEY_REPOSITORY } from '../ports/AnswerKeyRepository';

@Injectable()
export class GetAnswerKeys {
  constructor(
    @Inject(ANSWER_KEY_REPOSITORY) private readonly answerKeyRepository: AnswerKeyRepository,
  ) {}

  async execute(examVersionId: string): Promise<AnswerKey[]> {
    return this.answerKeyRepository.findByExamVersion(examVersionId);
  }
}
