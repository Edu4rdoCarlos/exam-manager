import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/database/prisma.service';
import { ExamVersion } from '../../domain/ExamVersion';
import { CreateExamVersionData, ExamVersionRepository } from '../../application/ports/ExamVersionRepository';

const includeAll = {
  examVersionQuestions: {
    include: { examVersionAlternatives: true },
  },
} as const;

@Injectable()
export class PrismaExamVersionRepository implements ExamVersionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ExamVersion | null> {
    return this.prisma.examVersion.findUnique({ where: { id }, include: includeAll });
  }

  async findByExamId(examId: string): Promise<ExamVersion[]> {
    return this.prisma.examVersion.findMany({ where: { examId }, include: includeAll });
  }

  async save(data: CreateExamVersionData): Promise<ExamVersion> {
    return this.prisma.examVersion.create({
      data: {
        id: data.id,
        examId: data.examId,
        versionNumber: data.versionNumber,
        examVersionQuestions: {
          create: data.questions.map((q) => ({
            id: q.id,
            questionId: q.questionId,
            position: q.position,
            examVersionAlternatives: {
              create: q.alternatives.map((a) => ({
                id: a.id,
                alternativeId: a.alternativeId,
                position: a.position,
                label: a.label,
              })),
            },
          })),
        },
      },
      include: includeAll,
    });
  }
}
