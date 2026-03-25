import { Grade } from '../../domain/Grade';

export interface GradeRepository {
  findByCorrection(correctionId: string): Promise<Grade[]>;
  findByExamVersion(examVersionId: string): Promise<Grade[]>;
  saveMany(grades: Grade[]): Promise<Grade[]>;
}

export const GRADE_REPOSITORY = Symbol('GradeRepository');
