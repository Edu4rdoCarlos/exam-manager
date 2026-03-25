import { Inject, Injectable } from '@nestjs/common';
import { Grade } from '../../../domain/grade/Grade';
import { GradeRepository, GRADE_REPOSITORY } from '../ports/GradeRepository';

@Injectable()
export class GetGrades {
  constructor(
    @Inject(GRADE_REPOSITORY) private readonly gradeRepository: GradeRepository,
  ) {}

  async findByExamVersion(examVersionId: string): Promise<Grade[]> {
    return this.gradeRepository.findByExamVersion(examVersionId);
  }

  async findByCorrection(correctionId: string): Promise<Grade[]> {
    return this.gradeRepository.findByCorrection(correctionId);
  }
}
