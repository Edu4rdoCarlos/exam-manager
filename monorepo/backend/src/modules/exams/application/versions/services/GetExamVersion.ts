import { Inject, Injectable } from '@nestjs/common';
import { ExamVersion } from '../../../domain/versions/ExamVersion';
import { ExamVersionRepository, EXAM_VERSION_REPOSITORY } from '../ports/ExamVersionRepository';
import { ExamVersionNotFound } from '../../../domain/versions/errors/ExamVersionNotFound';
import { Result, success, failure } from '../../../../../shared/result';

@Injectable()
export class GetExamVersion {
  constructor(
    @Inject(EXAM_VERSION_REPOSITORY)
    private readonly examVersionRepository: ExamVersionRepository,
  ) {}

  async execute(id: string): Promise<Result<ExamVersion, ExamVersionNotFound>> {
    const version = await this.examVersionRepository.findById(id);
    if (!version) return failure(new ExamVersionNotFound(id));
    return success(version);
  }

  async findByExamId(examId: string): Promise<ExamVersion[]> {
    return this.examVersionRepository.findByExamId(examId);
  }
}
