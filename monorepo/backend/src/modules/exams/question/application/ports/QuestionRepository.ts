import { Question } from '../../domain/Question';

export interface CreateQuestionData {
  readonly id: string;
  readonly statement: string;
  readonly alternatives: Array<{
    readonly id: string;
    readonly description: string;
    readonly isCorrect: boolean;
  }>;
}

export interface QuestionRepository {
  findById(id: string): Promise<Question | null>;
  findAll(): Promise<Question[]>;
  save(data: CreateQuestionData): Promise<Question>;
}

export const QUESTION_REPOSITORY = Symbol('QuestionRepository');
