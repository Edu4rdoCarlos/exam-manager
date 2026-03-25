import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { StudentAnswer } from '../../domain/StudentAnswer';
import { StudentAnswerRepository, STUDENT_ANSWER_REPOSITORY } from '../ports/StudentAnswerRepository';
import { Result, success } from '../../../../../shared/result';

export interface SubmitStudentAnswersInput {
  readonly studentId: string;
  readonly examVersionId: string;
  readonly answers: Array<{
    readonly questionId: string;
    readonly answer: string;
  }>;
}

@Injectable()
export class SubmitStudentAnswers {
  constructor(
    @Inject(STUDENT_ANSWER_REPOSITORY)
    private readonly studentAnswerRepository: StudentAnswerRepository,
  ) {}

  async execute(input: SubmitStudentAnswersInput): Promise<Result<StudentAnswer[], never>> {
    const answers: StudentAnswer[] = input.answers.map((a) => ({
      id: randomUUID(),
      studentId: input.studentId,
      examVersionId: input.examVersionId,
      questionId: a.questionId,
      answer: a.answer,
    }));

    const saved = await this.studentAnswerRepository.saveMany(answers);
    return success(saved);
  }
}
