export type AnswerFormat = 'letters' | 'powers_of_two';

export interface Exam {
  readonly id: string;
  readonly title: string;
  readonly subject: string;
  readonly teacherId: string;
  readonly examDate: Date | null;
  readonly answerFormat: AnswerFormat;
  readonly createdAt: Date | null;
}
