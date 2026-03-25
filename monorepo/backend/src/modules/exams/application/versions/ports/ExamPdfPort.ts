export interface ExamPdfAlternative {
  readonly label: string;
  readonly description: string;
}

export interface ExamPdfQuestion {
  readonly position: number;
  readonly statement: string;
  readonly alternatives: ExamPdfAlternative[];
}

export interface ExamPdfData {
  readonly examTitle: string;
  readonly examSubject: string;
  readonly examDate: Date | null;
  readonly answerFormat: string;
  readonly versionNumber: number;
  readonly questions: ExamPdfQuestion[];
}

export interface ExamPdfPort {
  generate(data: ExamPdfData): Promise<Buffer>;
}

export const EXAM_PDF_PORT = Symbol('ExamPdfPort');
