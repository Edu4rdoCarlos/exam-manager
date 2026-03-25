import { Injectable } from '@nestjs/common';
import { AnswerFormat } from '@exam-manager/database';
import { PrismaService } from '../../../../../shared/database/prisma.service';
import { Exam } from '../../domain/Exam';
import { CreateExamData, ExamRepository, ExamWithDetails } from '../../application/ports/ExamRepository';
import { randomUUID } from 'crypto';

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
            question: {
              include: { alternatives: true },
            },
          },
        },
      },
    });
    if (!row) return null;

    type ExamQuestionRow = { questionId: string; position: number; question: { alternatives: { id: string }[] } };
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
    const rows = await this.prisma.exam.findMany() as Array<{ id: string; title: string; subject: string; teacherId: string; examDate: Date | null; answerFormat: AnswerFormat; createdAt: Date | null }>;
    return rows.map((r) => this.toDomain(r));
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
    return this.toDomain(row);
  }

  private toDomain(row: { id: string; title: string; subject: string; teacherId: string; examDate: Date | null; answerFormat: AnswerFormat; createdAt: Date | null }): Exam {
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
