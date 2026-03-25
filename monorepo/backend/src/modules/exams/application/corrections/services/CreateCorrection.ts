import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Correction } from '../../../domain/corrections/Correction';
import { CorrectionRepository, CORRECTION_REPOSITORY } from '../ports/CorrectionRepository';
import { ExamRepository, EXAM_REPOSITORY } from '../../exam/ports/ExamRepository';
import { ExamNotFound } from '../../../domain/exam/errors/ExamNotFound';
import { Result, success, failure } from '../../../../../shared/result';

export interface CreateCorrectionInput {
  readonly examId: string;
  readonly correctionMode: Correction['correctionMode'];
}

@Injectable()
export class CreateCorrection {
  constructor(
    @Inject(CORRECTION_REPOSITORY)
    private readonly correctionRepository: CorrectionRepository,
    @Inject(EXAM_REPOSITORY)
    private readonly examRepository: ExamRepository,
  ) {}

  async execute(input: CreateCorrectionInput): Promise<Result<Correction, ExamNotFound>> {
    const exam = await this.examRepository.findById(input.examId);
    if (!exam) return failure(new ExamNotFound(input.examId));

    const saved = await this.correctionRepository.save({
      id: randomUUID(),
      examId: input.examId,
      correctionMode: input.correctionMode,
      createdAt: new Date(),
    });
    return success(saved);
  }
}
