import { Inject, Injectable } from '@nestjs/common';
import { ExamVersionRepository, EXAM_VERSION_REPOSITORY } from '../ports/ExamVersionRepository';
import { ExamRepository, EXAM_REPOSITORY } from '../../../exam/application/ports/ExamRepository';
import { QuestionRepository, QUESTION_REPOSITORY } from '../../../question/application/ports/QuestionRepository';
import { ExamPdfPort, ExamPdfData, ExamPdfQuestion, EXAM_PDF_PORT } from '../ports/ExamPdfPort';
import { ExamVersionNotFound } from '../../domain/errors/ExamVersionNotFound';
import { Result, success, failure } from '../../../../../shared/result';

@Injectable()
export class GenerateExamVersionPdf {
  constructor(
    @Inject(EXAM_VERSION_REPOSITORY) private readonly examVersionRepository: ExamVersionRepository,
    @Inject(EXAM_REPOSITORY) private readonly examRepository: ExamRepository,
    @Inject(QUESTION_REPOSITORY) private readonly questionRepository: QuestionRepository,
    @Inject(EXAM_PDF_PORT) private readonly examPdfPort: ExamPdfPort,
  ) {}

  async execute(examVersionId: string): Promise<Result<Buffer, ExamVersionNotFound>> {
    const version = await this.examVersionRepository.findById(examVersionId);
    if (!version) return failure(new ExamVersionNotFound(examVersionId));

    const exam = await this.examRepository.findById(version.examId);
    if (!exam) return failure(new ExamVersionNotFound(examVersionId));

    const uniqueQuestionIds = [...new Set(version.examVersionQuestions.map((q) => q.questionId))];
    const questionRows = await Promise.all(uniqueQuestionIds.map((id) => this.questionRepository.findById(id)));
    const questionMap = new Map(questionRows.filter(Boolean).map((q) => [q!.id, q!]));

    const questions: ExamPdfQuestion[] = version.examVersionQuestions
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((evq) => {
        const question = questionMap.get(evq.questionId);
        return {
          position: evq.position,
          statement: question?.statement ?? '',
          alternatives: evq.examVersionAlternatives
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((eva) => {
              const alternative = question?.alternatives.find((a) => a.id === eva.alternativeId);
              return {
                label: eva.label,
                description: alternative?.description ?? '',
              };
            }),
        };
      });

    const pdfData: ExamPdfData = {
      examTitle: exam.title,
      examSubject: exam.subject,
      examDate: exam.examDate,
      answerFormat: exam.answerFormat,
      versionNumber: version.versionNumber,
      questions,
    };

    const buffer = await this.examPdfPort.generate(pdfData);
    return success(buffer);
  }
}
