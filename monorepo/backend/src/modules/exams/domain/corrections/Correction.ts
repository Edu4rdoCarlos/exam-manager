export type CorrectionMode = 'strict' | 'lenient';

export interface Correction {
  readonly id: string;
  readonly examId: string;
  readonly correctionMode: CorrectionMode;
  readonly createdAt: Date | null;
}
