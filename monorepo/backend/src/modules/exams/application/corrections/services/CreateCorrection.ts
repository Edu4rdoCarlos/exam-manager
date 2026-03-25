import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Correction } from '../../../domain/corrections/Correction';
import { CorrectionRepository, CORRECTION_REPOSITORY } from '../ports/CorrectionRepository';
import { Result, success } from '../../../../../shared/result';

export interface CreateCorrectionInput {
  readonly examId: string;
  readonly correctionMode: Correction['correctionMode'];
}

@Injectable()
export class CreateCorrection {
  constructor(
    @Inject(CORRECTION_REPOSITORY)
    private readonly correctionRepository: CorrectionRepository,
  ) {}

  async execute(input: CreateCorrectionInput): Promise<Result<Correction, never>> {
    const saved = await this.correctionRepository.save({
      id: randomUUID(),
      examId: input.examId,
      correctionMode: input.correctionMode,
      createdAt: new Date(),
    });
    return success(saved);
  }
}
