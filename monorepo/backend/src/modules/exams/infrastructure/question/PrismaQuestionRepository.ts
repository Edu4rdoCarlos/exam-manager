import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { Question, Alternative } from '../../domain/question/Question';
import { CreateQuestionData, UpdateQuestionData, QuestionRepository } from '../../application/question/ports/QuestionRepository';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Question | null> {
    const row = await this.prisma.question.findUnique({
      where: { id },
      include: { alternatives: true },
    });
    if (!row) return null;
    return this.toDomain(row);
  }

  async findAll(): Promise<Question[]> {
    const rows = await this.prisma.question.findMany({ include: { alternatives: true } });
    return rows.map((r) => this.toDomain(r));
  }

  async save(data: CreateQuestionData): Promise<Question> {
    const row = await this.prisma.question.create({
      data: {
        id: data.id,
        statement: data.statement,
        alternatives: {
          create: data.alternatives.map((a) => ({
            id: a.id,
            description: a.description,
            isCorrect: a.isCorrect,
          })),
        },
      },
      include: { alternatives: true },
    });
    return this.toDomain(row);
  }

  async update(id: string, data: UpdateQuestionData): Promise<Question | null> {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) return null;

    if (data.alternatives !== undefined) {
      const currentAlternatives = await this.prisma.alternative.findMany({
        where: { questionId: id },
        select: { id: true },
      });
      const alternativeIds = currentAlternatives.map((a) => a.id);
      await this.prisma.examVersionAlternative.deleteMany({
        where: { alternativeId: { in: alternativeIds } },
      });
      await this.prisma.alternative.deleteMany({ where: { questionId: id } });
    }

    const row = await this.prisma.question.update({
      where: { id },
      data: {
        ...(data.statement !== undefined && { statement: data.statement }),
        ...(data.alternatives !== undefined && {
          alternatives: {
            create: data.alternatives.map((a) => ({
              id: randomUUID(),
              description: a.description,
              isCorrect: a.isCorrect,
            })),
          },
        }),
      },
      include: { alternatives: true },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    const alternatives = await this.prisma.alternative.findMany({
      where: { questionId: id },
      select: { id: true },
    });
    const alternativeIds = alternatives.map((a) => a.id);
    await this.prisma.examVersionAlternative.deleteMany({
      where: { alternativeId: { in: alternativeIds } },
    });
    await this.prisma.alternative.deleteMany({ where: { questionId: id } });
    await this.prisma.question.delete({ where: { id } });
  }

  async isUsedInExam(id: string): Promise<boolean> {
    const row = await this.prisma.examQuestion.findFirst({ where: { questionId: id } });
    return row !== null;
  }

  private toDomain(row: {
    id: string;
    statement: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    alternatives: Array<{ id: string; questionId: string; description: string; isCorrect: boolean }>;
  }): Question {
    return {
      id: row.id,
      statement: row.statement,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      alternatives: row.alternatives.map(
        (a): Alternative => ({
          id: a.id,
          questionId: a.questionId,
          description: a.description,
          isCorrect: a.isCorrect,
        }),
      ),
    };
  }
}
