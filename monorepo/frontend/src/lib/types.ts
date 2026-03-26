export type AnswerFormat = "letters" | "powers_of_two";
export type CorrectionMode = "strict" | "lenient";

export interface UserMeExam {
  id: string;
  title: string;
  subject: string;
  examDate: string | null;
  answerFormat: AnswerFormat;
  createdAt: string | null;
}

export interface UserMe {
  id: string;
  name: string;
  email: string;
  createdAt: string | null;
  exams: UserMeExam[];
}

export interface Alternative {
  id: string;
  questionId: string;
  description: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  statement: string;
  createdAt: string | null;
  updatedAt: string | null;
  alternatives: Alternative[];
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  teacherId: string;
  examDate: string | null;
  answerFormat: AnswerFormat;
  createdAt: string | null;
}

export interface ExamVersionAlternative {
  id: string;
  examVersionQuestionId: string;
  alternativeId: string;
  position: number;
  label: string;
}

export interface ExamVersionQuestion {
  id: string;
  examVersionId: string;
  questionId: string;
  position: number;
  examVersionAlternatives: ExamVersionAlternative[];
}

export interface ExamVersion {
  id: string;
  examId: string;
  versionNumber: number;
  createdAt: string | null;
  examVersionQuestions: ExamVersionQuestion[];
}

export interface AnswerKey {
  id: string;
  examVersionId: string;
  examVersionQuestionId: string;
  correctAnswer: string;
}

export interface Student {
  id: string;
  name: string;
  cpf: string;
}

export interface Correction {
  id: string;
  examId: string;
  correctionMode: CorrectionMode;
  createdAt: string | null;
}

export interface GradeReport {
  gradeId: string;
  score: number;
  correctionId: string;
  student: { id: string; name: string; cpf: string };
  exam: { id: string; title: string; subject: string };
  examVersion: { id: string; versionNumber: number };
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: PaginationMetadata;
}

export interface HttpResponse<T> {
  data: T;
}
