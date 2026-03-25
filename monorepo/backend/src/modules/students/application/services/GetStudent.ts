import { Inject, Injectable } from '@nestjs/common';
import { Student } from '../../domain/Student';
import { StudentRepository, STUDENT_REPOSITORY } from '../ports/StudentRepository';
import { StudentNotFound } from '../../domain/errors/StudentNotFound';
import { Result, success, failure } from '../../../../../shared/result';

@Injectable()
export class GetStudent {
  constructor(
    @Inject(STUDENT_REPOSITORY) private readonly studentRepository: StudentRepository,
  ) {}

  async execute(id: string): Promise<Result<Student, StudentNotFound>> {
    const student = await this.studentRepository.findById(id);
    if (!student) return failure(new StudentNotFound(id));
    return success(student);
  }
}
