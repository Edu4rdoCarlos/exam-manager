export interface ExamVersionAlternative {
  readonly id: string;
  readonly examVersionQuestionId: string;
  readonly alternativeId: string;
  readonly position: number;
  readonly label: string;
}

export interface ExamVersionQuestion {
  readonly id: string;
  readonly examVersionId: string;
  readonly questionId: string;
  readonly position: number;
  readonly examVersionAlternatives: ExamVersionAlternative[];
}

export interface ExamVersion {
  readonly id: string;
  readonly examId: string;
  readonly versionNumber: number;
  readonly createdAt: Date | null;
  readonly examVersionQuestions: ExamVersionQuestion[];
}
