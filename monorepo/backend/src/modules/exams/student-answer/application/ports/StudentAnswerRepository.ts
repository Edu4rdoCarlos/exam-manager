import { StudentAnswer } from '../../domain/StudentAnswer';

export interface StudentAnswerRepository {
  findByStudentAndExamVersion(studentId: string, examVersionId: string): Promise<StudentAnswer[]>;
  findByExamVersion(examVersionId: string): Promise<StudentAnswer[]>;
  saveMany(answers: StudentAnswer[]): Promise<StudentAnswer[]>;
}

export const STUDENT_ANSWER_REPOSITORY = Symbol('StudentAnswerRepository');
