import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { ExamVersion } from '../../../domain/versions/ExamVersion';
import { ExamVersionRepository, EXAM_VERSION_REPOSITORY } from '../ports/ExamVersionRepository';
import { ExamRepository, EXAM_REPOSITORY, ExamWithDetails } from '../../exam/ports/ExamRepository';
import { AnswerKeyRepository, ANSWER_KEY_REPOSITORY } from '../../keys/ports/AnswerKeyRepository';
import { Result, success, failure } from '../../../../../shared/result';
import { ExamNotFound } from '../../../domain/exam/errors/ExamNotFound';

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
    @Inject(ANSWER_KEY_REPOSITORY)
    private readonly answerKeyRepository: AnswerKeyRepository,
  ) {}

  async execute(input: CreateExamVersionInput): Promise<Result<ExamVersion, ExamNotFound>> {
    const exam = await this.examRepository.findByIdWithDetails(input.examId);
    if (!exam) return failure(new ExamNotFound(input.examId));

    const shuffledQuestions = this.shuffle([...exam.examQuestions]);

    const questionDrafts = shuffledQuestions.map((q, questionIndex) => {
      const shuffledAlternatives = this.shuffle([...q.alternatives]);
      const correctIndex = shuffledAlternatives.findIndex((a) => a.isCorrect);
      return {
        id: randomUUID(),
        questionId: q.questionId,
        position: questionIndex + 1,
        correctLabel: correctIndex >= 0 ? this.generateLabel(exam.answerFormat, correctIndex) : null,
        alternatives: shuffledAlternatives.map((a, altIndex) => ({
          id: randomUUID(),
          alternativeId: a.id,
          position: altIndex + 1,
          label: this.generateLabel(exam.answerFormat, altIndex),
        })),
      };
    });

    const saved = await this.examVersionRepository.save({
      id: randomUUID(),
      examId: input.examId,
      versionNumber: input.versionNumber,
      questions: questionDrafts.map(({ id, questionId, position, alternatives }) => ({
        id,
        questionId,
        position,
        alternatives,
      })),
    });

    const answerKeys = questionDrafts
      .filter((q) => q.correctLabel !== null)
      .map((q) => ({
        id: randomUUID(),
        examVersionId: saved.id,
        examVersionQuestionId: q.id,
        correctAnswer: q.correctLabel as string,
      }));

    if (answerKeys.length > 0) {
      await this.answerKeyRepository.saveMany(answerKeys);
    }

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
