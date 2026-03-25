import { Exam } from '../../../domain/exam/Exam';

export interface CreateExamData {
  readonly id: string;
  readonly title: string;
  readonly subject: string;
  readonly teacherId: string;
  readonly examDate: Date | null;
  readonly answerFormat: Exam['answerFormat'];
  readonly questionIds: Array<{ readonly questionId: string; readonly position: number }>;
}

export interface ExamAlternativeData {
  readonly id: string;
}

export interface ExamQuestionData {
  readonly questionId: string;
  readonly position: number;
  readonly alternatives: ExamAlternativeData[];
}

export interface ExamWithDetails extends Exam {
  readonly examQuestions: ExamQuestionData[];
}

export interface UpdateExamData {
  readonly title?: string;
  readonly subject?: string;
  readonly examDate?: Date | null;
  readonly answerFormat?: Exam['answerFormat'];
  readonly questionIds?: Array<{ readonly questionId: string; readonly position: number }>;
}

export interface ExamRepository {
  findById(id: string): Promise<Exam | null>;
  findByIdWithDetails(id: string): Promise<ExamWithDetails | null>;
  findAll(): Promise<Exam[]>;
  findByTeacherId(teacherId: string): Promise<Exam[]>;
  save(data: CreateExamData): Promise<Exam>;
  update(id: string, data: UpdateExamData): Promise<Exam | null>;
  delete(id: string): Promise<void>;
  hasVersions(id: string): Promise<boolean>;
}

export const EXAM_REPOSITORY = Symbol('ExamRepository');
