import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { AnswerKey } from '../../domain/keys/AnswerKey';
import { AnswerKeyRepository } from '../../application/keys/ports/AnswerKeyRepository';

@Injectable()
export class PrismaAnswerKeyRepository implements AnswerKeyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByExamVersion(examVersionId: string): Promise<AnswerKey[]> {
    return this.prisma.answerKey.findMany({ where: { examVersionId } });
  }

  async saveMany(keys: AnswerKey[]): Promise<AnswerKey[]> {
    await this.prisma.answerKey.createMany({
      data: keys.map((k) => ({
        id: k.id,
        examVersionId: k.examVersionId,
        examVersionQuestionId: k.examVersionQuestionId,
        correctAnswer: k.correctAnswer,
      })),
    });
    return keys;
  }
}
