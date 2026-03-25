import { Inject, Injectable } from '@nestjs/common';
import { Exam } from '../../../domain/exam/Exam';
import { ExamRepository, UpdateExamData, EXAM_REPOSITORY } from '../ports/ExamRepository';
import { ExamNotFound } from '../../../domain/exam/errors/ExamNotFound';
import { Result, success, failure } from '../../../../../shared/result';

export type UpdateExamInput = UpdateExamData;

@Injectable()
export class UpdateExam {
  constructor(
    @Inject(EXAM_REPOSITORY) private readonly examRepository: ExamRepository,
  ) {}

  async execute(id: string, input: UpdateExamInput): Promise<Result<Exam, ExamNotFound>> {
    const updated = await this.examRepository.update(id, input);
    if (!updated) return failure(new ExamNotFound(id));
    return success(updated);
  }
}
