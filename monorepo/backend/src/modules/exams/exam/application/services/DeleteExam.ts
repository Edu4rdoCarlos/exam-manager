import { Inject, Injectable } from '@nestjs/common';
import { ExamRepository, EXAM_REPOSITORY } from '../ports/ExamRepository';
import { ExamNotFound } from '../../domain/errors/ExamNotFound';
import { ExamInUse } from '../../domain/errors/ExamInUse';
import { Result, success, failure } from '../../../../../shared/result';

@Injectable()
export class DeleteExam {
  constructor(
    @Inject(EXAM_REPOSITORY) private readonly examRepository: ExamRepository,
  ) {}

  async execute(id: string): Promise<Result<void, ExamNotFound | ExamInUse>> {
    const existing = await this.examRepository.findById(id);
    if (!existing) return failure(new ExamNotFound(id));

    const hasVersions = await this.examRepository.hasVersions(id);
    if (hasVersions) return failure(new ExamInUse(id));

    await this.examRepository.delete(id);
    return success(undefined);
  }
}
