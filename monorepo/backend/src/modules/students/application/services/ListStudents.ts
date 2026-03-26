import { Inject, Injectable } from '@nestjs/common';
import { Student } from '../../domain/Student';
import { StudentRepository, STUDENT_REPOSITORY } from '../ports/StudentRepository';

@Injectable()
export class ListStudents {
  constructor(
    @Inject(STUDENT_REPOSITORY) private readonly studentRepository: StudentRepository,
  ) {}

  async execute(page: number, perPage: number): Promise<{ students: Student[]; totalItems: number; totalPages: number }> {
    const { students, totalItems } = await this.studentRepository.findAllPaginated(page, perPage);
    const totalPages = Math.ceil(totalItems / perPage);
    return { students, totalItems, totalPages };
  }
}
