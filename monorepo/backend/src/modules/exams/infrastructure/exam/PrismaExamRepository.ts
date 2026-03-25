import { Injectable } from '@nestjs/common';
import { AnswerFormat } from '@exam-manager/database';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { Exam } from '../../domain/exam/Exam';
import { CreateExamData, UpdateExamData, ExamRepository, ExamWithDetails } from '../../application/exam/ports/ExamRepository';

type ExamRow = {
  id: string;
  title: string;
  subject: string;
  teacherId: string;
  examDate: Date | null;
  answerFormat: AnswerFormat;
  createdAt: Date | null;
};

@Injectable()
export class PrismaExamRepository implements ExamRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Exam | null> {
    const row = await this.prisma.exam.findUnique({ where: { id } });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findByIdWithDetails(id: string): Promise<ExamWithDetails | null> {
    const row = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        examQuestions: {
          include: {
            question: { include: { alternatives: true } },
          },
        },
      },
    });
    if (!row) return null;

    type ExamQuestionRow = {
      questionId: string;
      position: number;
      question: { alternatives: { id: string }[] };
    };

    return {
      ...this.toDomain(row),
      examQuestions: (row.examQuestions as ExamQuestionRow[]).map((eq) => ({
        questionId: eq.questionId,
        position: eq.position,
        alternatives: eq.question.alternatives.map((a) => ({ id: a.id })),
      })),
    };
  }

  async findAll(): Promise<Exam[]> {
    const rows = await this.prisma.exam.findMany();
    return rows.map((r) => this.toDomain(r as ExamRow));
  }

  async save(data: CreateExamData): Promise<Exam> {
    const row = await this.prisma.exam.create({
      data: {
        id: data.id,
        title: data.title,
        subject: data.subject,
        teacherId: data.teacherId,
        examDate: data.examDate,
        answerFormat: data.answerFormat as AnswerFormat,
        examQuestions: {
          create: data.questionIds.map((q) => ({
            id: randomUUID(),
            questionId: q.questionId,
            position: q.position,
          })),
        },
      },
    });
    return this.toDomain(row as ExamRow);
  }

  async update(id: string, data: UpdateExamData): Promise<Exam | null> {
    const existing = await this.prisma.exam.findUnique({ where: { id } });
    if (!existing) return null;

    if (data.questionIds !== undefined) {
      await this.prisma.examQuestion.deleteMany({ where: { examId: id } });
    }

    const row = await this.prisma.exam.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subject !== undefined && { subject: data.subject }),
        ...(data.examDate !== undefined && { examDate: data.examDate }),
        ...(data.answerFormat !== undefined && { answerFormat: data.answerFormat as AnswerFormat }),
        ...(data.questionIds !== undefined && {
          examQuestions: {
            create: data.questionIds.map((q) => ({
              id: randomUUID(),
              questionId: q.questionId,
              position: q.position,
            })),
          },
        }),
      },
    });
    return this.toDomain(row as ExamRow);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.exam.delete({ where: { id } });
  }

  async hasVersions(id: string): Promise<boolean> {
    const row = await this.prisma.examVersion.findFirst({ where: { examId: id } });
    return row !== null;
  }

  private toDomain(row: ExamRow): Exam {
    return {
      id: row.id,
      title: row.title,
      subject: row.subject,
      teacherId: row.teacherId,
      examDate: row.examDate,
      answerFormat: row.answerFormat as Exam['answerFormat'],
      createdAt: row.createdAt,
    };
  }
}
