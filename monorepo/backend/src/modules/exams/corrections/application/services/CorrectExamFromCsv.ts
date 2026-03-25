import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CorrectionRepository, CORRECTION_REPOSITORY } from '../ports/CorrectionRepository';
import { CorrectionNotFound } from '../../domain/errors/CorrectionNotFound';
import { ExamVersionRepository, EXAM_VERSION_REPOSITORY } from '../../../versions/application/ports/ExamVersionRepository';
import { StudentAnswerRepository, STUDENT_ANSWER_REPOSITORY } from '../../../student-answer/application/ports/StudentAnswerRepository';
import { StudentAnswerCsvParserPort, STUDENT_ANSWER_CSV_PARSER_PORT } from '../../../student-answer/application/ports/StudentAnswerCsvParserPort';
import { StudentRepository, STUDENT_REPOSITORY } from '../../../../students/application/ports/StudentRepository';
import { StudentNotFound } from '../../../../students/domain/errors/StudentNotFound';
import { ExamVersionNotFound } from '../../../versions/domain/errors/ExamVersionNotFound';
import { ApplyCorrection, ApplyCorrectionResult } from './ApplyCorrection';
import { Result, success, failure } from '../../../../../shared/result';

export interface CorrectExamFromCsvInput {
  readonly correctionId: string;
  readonly csvContent: string;
}

@Injectable()
export class CorrectExamFromCsv {
  constructor(
    @Inject(CORRECTION_REPOSITORY) private readonly correctionRepository: CorrectionRepository,
    @Inject(EXAM_VERSION_REPOSITORY) private readonly examVersionRepository: ExamVersionRepository,
    @Inject(STUDENT_ANSWER_REPOSITORY) private readonly studentAnswerRepository: StudentAnswerRepository,
    @Inject(STUDENT_ANSWER_CSV_PARSER_PORT) private readonly csvParser: StudentAnswerCsvParserPort,
    @Inject(STUDENT_REPOSITORY) private readonly studentRepository: StudentRepository,
    private readonly applyCorrection: ApplyCorrection,
  ) {}

  async execute(
    input: CorrectExamFromCsvInput,
  ): Promise<Result<ApplyCorrectionResult, CorrectionNotFound | StudentNotFound | ExamVersionNotFound>> {
    const correction = await this.correctionRepository.findById(input.correctionId);
    if (!correction) return failure(new CorrectionNotFound(input.correctionId));

    const rows = this.csvParser.parse(input.csvContent);

    for (const row of rows) {
      const student = await this.studentRepository.findByCpf(row.cpf);
      if (!student) return failure(new StudentNotFound(row.cpf));

      const version = await this.examVersionRepository.findById(row.examVersionId);
      if (!version) return failure(new ExamVersionNotFound(row.examVersionId));

      const sortedQuestions = version.examVersionQuestions
        .slice()
        .sort((a, b) => a.position - b.position);

      const studentAnswers = sortedQuestions
        .map((evq, index) => ({
          id: randomUUID(),
          studentId: student.id,
          examVersionId: version.id,
          questionId: evq.questionId,
          answer: row.answers[index] ?? '',
        }))
        .filter((sa) => sa.answer !== '');

      await this.studentAnswerRepository.saveMany(studentAnswers);
    }

    return this.applyCorrection.execute({ correctionId: input.correctionId });
  }
}
