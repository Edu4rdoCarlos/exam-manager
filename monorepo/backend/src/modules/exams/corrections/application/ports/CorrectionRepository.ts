import { Correction } from '../../domain/Correction';

export interface CorrectionRepository {
  findById(id: string): Promise<Correction | null>;
  save(correction: Correction): Promise<Correction>;
}

export const CORRECTION_REPOSITORY = Symbol('CorrectionRepository');
