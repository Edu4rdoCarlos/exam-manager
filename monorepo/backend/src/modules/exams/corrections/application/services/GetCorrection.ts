import { Inject, Injectable } from '@nestjs/common';
import { Correction } from '../../domain/Correction';
import { CorrectionNotFound } from '../../domain/errors/CorrectionNotFound';
import { CorrectionRepository, CORRECTION_REPOSITORY } from '../ports/CorrectionRepository';
import { Result, success, failure } from '../../../../../shared/result';

@Injectable()
export class GetCorrection {
  constructor(
    @Inject(CORRECTION_REPOSITORY)
    private readonly correctionRepository: CorrectionRepository,
  ) {}

  async execute(id: string): Promise<Result<Correction, CorrectionNotFound>> {
    const correction = await this.correctionRepository.findById(id);
    if (!correction) return failure(new CorrectionNotFound(id));
    return success(correction);
  }
}
