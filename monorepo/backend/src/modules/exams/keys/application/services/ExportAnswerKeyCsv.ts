import { Inject, Injectable } from '@nestjs/common';
import { AnswerKeyRepository, ANSWER_KEY_REPOSITORY } from '../ports/AnswerKeyRepository';
import { ExamVersionRepository, EXAM_VERSION_REPOSITORY } from '../../../versions/application/ports/ExamVersionRepository';
import { AnswerKeyCsvPort, ANSWER_KEY_CSV_PORT } from '../ports/AnswerKeyCsvPort';
import { ExamVersionNotFound } from '../../../versions/domain/errors/ExamVersionNotFound';
import { Result, success, failure } from '../../../../../shared/result';

@Injectable()
export class ExportAnswerKeyCsv {
  constructor(
    @Inject(ANSWER_KEY_REPOSITORY) private readonly answerKeyRepository: AnswerKeyRepository,
    @Inject(EXAM_VERSION_REPOSITORY) private readonly examVersionRepository: ExamVersionRepository,
    @Inject(ANSWER_KEY_CSV_PORT) private readonly answerKeyCsvPort: AnswerKeyCsvPort,
  ) {}

  async execute(examVersionId: string): Promise<Result<string, ExamVersionNotFound>> {
    const version = await this.examVersionRepository.findById(examVersionId);
    if (!version) return failure(new ExamVersionNotFound(examVersionId));

    const answerKeys = await this.answerKeyRepository.findByExamVersion(examVersionId);

    const positionMap = new Map(version.examVersionQuestions.map((evq) => [evq.id, evq.position]));

    const sortedAnswers = answerKeys
      .slice()
      .sort((a, b) => (positionMap.get(a.examVersionQuestionId) ?? 0) - (positionMap.get(b.examVersionQuestionId) ?? 0))
      .map((k) => k.correctAnswer);

    const csv = this.answerKeyCsvPort.generate({
      versionNumber: version.versionNumber,
      correctAnswers: sortedAnswers,
    });

    return success(csv);
  }
}
