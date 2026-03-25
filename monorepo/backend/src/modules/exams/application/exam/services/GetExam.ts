import { Inject, Injectable } from '@nestjs/common';
import { Exam } from '../../../domain/exam/Exam';
import { ExamRepository, EXAM_REPOSITORY } from '../ports/ExamRepository';
import { ExamNotFound } from '../../../domain/exam/errors/ExamNotFound';
import { Result, success, failure } from '../../../../../shared/result';

@Injectable()
export class GetExam {
  constructor(
    @Inject(EXAM_REPOSITORY) private readonly examRepository: ExamRepository,
  ) {}

  async execute(id: string): Promise<Result<Exam, ExamNotFound>> {
    const exam = await this.examRepository.findById(id);
    if (!exam) return failure(new ExamNotFound(id));
    return success(exam);
  }
}
