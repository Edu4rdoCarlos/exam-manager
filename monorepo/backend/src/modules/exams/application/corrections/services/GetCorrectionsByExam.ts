import { Inject, Injectable } from '@nestjs/common';
import { Correction } from '../../../domain/corrections/Correction';
import { CorrectionRepository, CORRECTION_REPOSITORY } from '../ports/CorrectionRepository';

@Injectable()
export class GetCorrectionsByExam {
  constructor(
    @Inject(CORRECTION_REPOSITORY)
    private readonly correctionRepository: CorrectionRepository,
  ) {}

  async execute(examId: string): Promise<Correction[]> {
    return this.correctionRepository.findByExamId(examId);
  }
}
