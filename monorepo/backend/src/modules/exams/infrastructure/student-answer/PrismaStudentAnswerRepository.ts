import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { StudentAnswer } from '../../domain/student-answer/StudentAnswer';
import { StudentAnswerRepository } from '../../application/student-answer/ports/StudentAnswerRepository';

@Injectable()
export class PrismaStudentAnswerRepository implements StudentAnswerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByStudentAndExamVersion(studentId: string, examVersionId: string): Promise<StudentAnswer[]> {
    const rows = await this.prisma.studentAnswer.findMany({ where: { studentId, examVersionId } });
    return rows.map((r) => this.toDomain(r));
  }

  async findByExamVersion(examVersionId: string): Promise<StudentAnswer[]> {
    const rows = await this.prisma.studentAnswer.findMany({ where: { examVersionId } });
    return rows.map((r) => this.toDomain(r));
  }

  async saveMany(answers: StudentAnswer[]): Promise<StudentAnswer[]> {
    await this.prisma.studentAnswer.createMany({
      data: answers.map((a) => ({
        id: a.id,
        studentId: a.studentId,
        examVersionId: a.examVersionId,
        questionId: a.questionId,
        answer: a.answer,
      })),
    });
    return answers;
  }

  private toDomain(row: { id: string; studentId: string; examVersionId: string; questionId: string; answer: string }): StudentAnswer {
    return {
      id: row.id,
      studentId: row.studentId,
      examVersionId: row.examVersionId,
      questionId: row.questionId,
      answer: row.answer,
    };
  }
}
