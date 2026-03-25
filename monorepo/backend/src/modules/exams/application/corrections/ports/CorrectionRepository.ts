import { Correction } from '../../../domain/corrections/Correction';

export interface CorrectionRepository {
  findById(id: string): Promise<Correction | null>;
  findByExamId(examId: string): Promise<Correction[]>;
  save(correction: Correction): Promise<Correction>;
}

export const CORRECTION_REPOSITORY = Symbol('CorrectionRepository');
