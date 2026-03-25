import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ExamVersion } from '../../domain/ExamVersion';
import { ExamVersionRepository, EXAM_VERSION_REPOSITORY } from '../ports/ExamVersionRepository';
import { ExamRepository, EXAM_REPOSITORY, ExamWithDetails } from '../../../exam/application/ports/ExamRepository';
import { Result, success, failure } from '../../../../../shared/result';
import { ExamNotFound } from '../../../exam/domain/errors/ExamNotFound';

export interface CreateExamVersionInput {
  readonly examId: string;
  readonly versionNumber: number;
}

@Injectable()
export class CreateExamVersion {
  constructor(
    @Inject(EXAM_VERSION_REPOSITORY)
    private readonly examVersionRepository: ExamVersionRepository,
    @Inject(EXAM_REPOSITORY)
    private readonly examRepository: ExamRepository,
  ) {}

  async execute(input: CreateExamVersionInput): Promise<Result<ExamVersion, ExamNotFound>> {
    const exam = await this.examRepository.findByIdWithDetails(input.examId);
    if (!exam) return failure(new ExamNotFound(input.examId));

    const shuffledQuestions = this.shuffle([...exam.examQuestions]);

    const saved = await this.examVersionRepository.save({
      id: randomUUID(),
      examId: input.examId,
      versionNumber: input.versionNumber,
      questions: shuffledQuestions.map((q, questionIndex) => {
        const shuffledAlternatives = this.shuffle([...q.alternatives]);
        return {
          id: randomUUID(),
          questionId: q.questionId,
          position: questionIndex + 1,
          alternatives: shuffledAlternatives.map((a, altIndex) => ({
            id: randomUUID(),
            alternativeId: a.id,
            position: altIndex + 1,
            label: this.generateLabel(exam.answerFormat, altIndex),
          })),
        };
      }),
    });

    return success(saved);
  }

  private shuffle<T>(items: T[]): T[] {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  private generateLabel(answerFormat: ExamWithDetails['answerFormat'], index: number): string {
    if (answerFormat === 'letters') {
      return String.fromCharCode(65 + index);
    }
    return String(Math.pow(2, index));
  }
}
