export interface Grade {
  readonly id: string;
  readonly studentId: string;
  readonly examVersionId: string;
  readonly correctionId: string;
  readonly score: number;
}
