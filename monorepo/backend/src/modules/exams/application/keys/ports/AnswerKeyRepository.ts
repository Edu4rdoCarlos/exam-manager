import { AnswerKey } from '../../../domain/keys/AnswerKey';

export interface AnswerKeyRepository {
  findByExamVersion(examVersionId: string): Promise<AnswerKey[]>;
  saveMany(keys: AnswerKey[]): Promise<AnswerKey[]>;
}

export const ANSWER_KEY_REPOSITORY = Symbol('AnswerKeyRepository');
