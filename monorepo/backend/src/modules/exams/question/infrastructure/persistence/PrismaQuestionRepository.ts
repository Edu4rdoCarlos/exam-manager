import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/database/prisma.service';
import { Question } from '../../domain/Question';
import { CreateQuestionData, QuestionRepository } from '../../application/ports/QuestionRepository';

@Injectable()
export class PrismaQuestionRepository implements QuestionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Question | null> {
    const row = await this.prisma.question.findUnique({
      where: { id },
      include: { alternatives: true },
    });
    return row;
  }

  async findAll(): Promise<Question[]> {
    return this.prisma.question.findMany({ include: { alternatives: true } });
  }

  async save(data: CreateQuestionData): Promise<Question> {
    return this.prisma.question.create({
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
  }
}
