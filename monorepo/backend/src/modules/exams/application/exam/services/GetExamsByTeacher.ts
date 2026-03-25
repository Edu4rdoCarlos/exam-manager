import { Inject, Injectable } from '@nestjs/common';
import { Exam } from '../../../domain/exam/Exam';
import { ExamRepository, EXAM_REPOSITORY } from '../ports/ExamRepository';

@Injectable()
export class GetExamsByTeacher {
  constructor(@Inject(EXAM_REPOSITORY) private readonly examRepository: ExamRepository) {}

  async execute(teacherId: string): Promise<Exam[]> {
    return this.examRepository.findByTeacherId(teacherId);
  }
}
