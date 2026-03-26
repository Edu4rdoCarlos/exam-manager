import { Student } from '../../domain/Student';

export interface StudentRepository {
  findAll(): Promise<Student[]>;
  findAllPaginated(page: number, perPage: number): Promise<{ students: Student[]; totalItems: number }>;
  findById(id: string): Promise<Student | null>;
  findByCpf(cpf: string): Promise<Student | null>;
  save(student: Student): Promise<Student>;
}

export const STUDENT_REPOSITORY = Symbol('StudentRepository');
