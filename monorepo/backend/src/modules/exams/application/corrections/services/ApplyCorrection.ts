import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CorrectionRepository, CORRECTION_REPOSITORY } from '../ports/CorrectionRepository';
import { CorrectionNotFound } from '../../../domain/corrections/errors/CorrectionNotFound';
import { CorrectionMode } from '../../../domain/corrections/Correction';
import { ExamRepository, EXAM_REPOSITORY } from '../../exam/ports/ExamRepository';
import { ExamVersionRepository, EXAM_VERSION_REPOSITORY } from '../../versions/ports/ExamVersionRepository';
import { AnswerKeyRepository, ANSWER_KEY_REPOSITORY } from '../../keys/ports/AnswerKeyRepository';
import { StudentAnswerRepository, STUDENT_ANSWER_REPOSITORY } from '../../student-answer/ports/StudentAnswerRepository';
import { GradeRepository, GRADE_REPOSITORY } from '../../grade/ports/GradeRepository';
import { AnswerKey } from '../../../domain/keys/AnswerKey';
import { StudentAnswer } from '../../../domain/student-answer/StudentAnswer';
import { ExamVersionQuestion } from '../../../domain/versions/ExamVersion';
import { Grade } from '../../../domain/grade/Grade';
import { Result, success, failure } from '../../../../../shared/result';
import { Exam } from '../../../domain/exam/Exam';

export interface ApplyCorrectionInput {
  readonly correctionId: string;
}

export interface ApplyCorrectionResult {
  readonly gradesCount: number;
}

@Injectable()
export class ApplyCorrection {
  constructor(
    @Inject(CORRECTION_REPOSITORY)
    private readonly correctionRepository: CorrectionRepository,
    @Inject(EXAM_REPOSITORY)
    private readonly examRepository: ExamRepository,
    @Inject(EXAM_VERSION_REPOSITORY)
    private readonly examVersionRepository: ExamVersionRepository,
    @Inject(ANSWER_KEY_REPOSITORY)
    private readonly answerKeyRepository: AnswerKeyRepository,
    @Inject(STUDENT_ANSWER_REPOSITORY)
    private readonly studentAnswerRepository: StudentAnswerRepository,
    @Inject(GRADE_REPOSITORY)
    private readonly gradeRepository: GradeRepository,
  ) {}

  async execute(input: ApplyCorrectionInput): Promise<Result<ApplyCorrectionResult, CorrectionNotFound>> {
    const correction = await this.correctionRepository.findById(input.correctionId);
    if (!correction) return failure(new CorrectionNotFound(input.correctionId));

    const exam = await this.examRepository.findById(correction.examId);
    if (!exam) return failure(new CorrectionNotFound(input.correctionId));

    const examVersions = await this.examVersionRepository.findByExamId(correction.examId);

    const allGrades: Grade[] = [];

    for (const version of examVersions) {
      const answerKeys = await this.answerKeyRepository.findByExamVersion(version.id);
      const studentAnswers = await this.studentAnswerRepository.findByExamVersion(version.id);

      const questionToAnswerKeyMap = this.buildQuestionToAnswerKeyMap(
        version.examVersionQuestions,
        answerKeys,
      );

      const answersByStudent = this.groupByStudent(studentAnswers);

      for (const [studentId, answers] of answersByStudent) {
        const score = this.calculateScore(
          answers,
          questionToAnswerKeyMap,
          correction.correctionMode,
          exam,
        );

        allGrades.push({
          id: randomUUID(),
          studentId,
          examVersionId: version.id,
          correctionId: correction.id,
          score,
        });
      }
    }

    await this.gradeRepository.saveMany(allGrades);
    return success({ gradesCount: allGrades.length });
  }

  private buildQuestionToAnswerKeyMap(
    examVersionQuestions: ExamVersionQuestion[],
    answerKeys: AnswerKey[],
  ): Map<string, string> {
    const evqIdToCorrectAnswer = new Map<string, string>(
      answerKeys.map((k) => [k.examVersionQuestionId, k.correctAnswer]),
    );

    const result = new Map<string, string>();
    for (const evq of examVersionQuestions) {
      const correctAnswer = evqIdToCorrectAnswer.get(evq.id);
      if (correctAnswer !== undefined) {
        result.set(evq.questionId, correctAnswer);
      }
    }
    return result;
  }

  private groupByStudent(answers: StudentAnswer[]): Map<string, StudentAnswer[]> {
    const map = new Map<string, StudentAnswer[]>();
    for (const answer of answers) {
      const existing = map.get(answer.studentId) ?? [];
      existing.push(answer);
      map.set(answer.studentId, existing);
    }
    return map;
  }

  private calculateScore(
    studentAnswers: StudentAnswer[],
    questionToAnswerKey: Map<string, string>,
    mode: CorrectionMode,
    exam: Exam,
  ): number {
    const total = questionToAnswerKey.size;
    if (total === 0) return 0;

    let correct = 0;
    for (const answer of studentAnswers) {
      const correctAnswer = questionToAnswerKey.get(answer.questionId);
      if (correctAnswer === undefined) continue;

      const isCorrect =
        mode === 'strict'
          ? this.compareStrict(answer.answer, correctAnswer)
          : this.compareLenient(answer.answer, correctAnswer, exam.answerFormat);

      if (isCorrect) correct++;
    }

    return correct / total;
  }

  private compareStrict(studentAnswer: string, correctAnswer: string): boolean {
    return studentAnswer === correctAnswer;
  }

  private compareLenient(studentAnswer: string, correctAnswer: string, answerFormat: Exam['answerFormat']): boolean {
    if (answerFormat === 'letters') {
      const correctSet = new Set(correctAnswer.split(''));
      return studentAnswer.split('').every((char) => correctSet.has(char));
    }

    const studentValue = parseInt(studentAnswer, 10);
    const correctValue = parseInt(correctAnswer, 10);
    if (isNaN(studentValue) || isNaN(correctValue)) return false;
    return (studentValue & correctValue) === studentValue;
  }
}
