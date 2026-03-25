import { ExamVersion } from '../../domain/ExamVersion';

export interface CreateExamVersionData {
  readonly id: string;
  readonly examId: string;
  readonly versionNumber: number;
  readonly questions: Array<{
    readonly id: string;
    readonly questionId: string;
    readonly position: number;
    readonly alternatives: Array<{
      readonly id: string;
      readonly alternativeId: string;
      readonly position: number;
      readonly label: string;
    }>;
  }>;
}

export interface ExamVersionRepository {
  findById(id: string): Promise<ExamVersion | null>;
  findByExamId(examId: string): Promise<ExamVersion[]>;
  save(data: CreateExamVersionData): Promise<ExamVersion>;
}

export const EXAM_VERSION_REPOSITORY = Symbol('ExamVersionRepository');
