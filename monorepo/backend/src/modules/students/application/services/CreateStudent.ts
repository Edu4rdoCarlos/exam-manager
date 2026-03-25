import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Student } from '../../domain/Student';
import { CpfAlreadyInUse } from '../../domain/errors/CpfAlreadyInUse';
import { StudentRepository, STUDENT_REPOSITORY } from '../ports/StudentRepository';
import { Result, success, failure } from '../../../../shared/result';

export interface CreateStudentInput {
  readonly name: string;
  readonly cpf: string;
}

@Injectable()
export class CreateStudent {
  constructor(
    @Inject(STUDENT_REPOSITORY) private readonly studentRepository: StudentRepository,
  ) {}

  async execute(input: CreateStudentInput): Promise<Result<Student, CpfAlreadyInUse>> {
    const existing = await this.studentRepository.findByCpf(input.cpf);
    if (existing) return failure(new CpfAlreadyInUse());

    const saved = await this.studentRepository.save({ id: randomUUID(), ...input });
    return success(saved);
  }
}
