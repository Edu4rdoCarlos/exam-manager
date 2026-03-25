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

export interface UpdateQuestionData {
  readonly statement?: string;
  readonly alternatives?: Array<{
    readonly description: string;
    readonly isCorrect: boolean;
  }>;
}

export interface QuestionRepository {
  findById(id: string): Promise<Question | null>;
  findAll(): Promise<Question[]>;
  save(data: CreateQuestionData): Promise<Question>;
  update(id: string, data: UpdateQuestionData): Promise<Question | null>;
  delete(id: string): Promise<void>;
  isUsedInExam(id: string): Promise<boolean>;
}

export const QUESTION_REPOSITORY = Symbol('QuestionRepository');
