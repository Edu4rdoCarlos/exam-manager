import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Exam } from '../../domain/Exam';
import { ExamRepository, EXAM_REPOSITORY } from '../ports/ExamRepository';
import { Result, success } from '../../../../../shared/result';

export interface CreateExamInput {
  readonly title: string;
  readonly subject: string;
  readonly teacherId: string;
  readonly examDate: Date | null;
  readonly answerFormat: Exam['answerFormat'];
  readonly questionIds: Array<{ readonly questionId: string; readonly position: number }>;
}

@Injectable()
export class CreateExam {
  constructor(
    @Inject(EXAM_REPOSITORY) private readonly examRepository: ExamRepository,
  ) {}

  async execute(input: CreateExamInput): Promise<Result<Exam, never>> {
    const saved = await this.examRepository.save({ id: randomUUID(), ...input });
    return success(saved);
  }
}
