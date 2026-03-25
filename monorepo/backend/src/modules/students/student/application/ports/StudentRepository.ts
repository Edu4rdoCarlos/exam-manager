import { Student } from '../../domain/Student';

export interface StudentRepository {
  findById(id: string): Promise<Student | null>;
  findByCpf(cpf: string): Promise<Student | null>;
  save(student: Student): Promise<Student>;
}

export const STUDENT_REPOSITORY = Symbol('StudentRepository');
