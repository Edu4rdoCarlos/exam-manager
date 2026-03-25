import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/database/prisma.service';
import { Grade } from '../../domain/Grade';
import { GradeRepository } from '../../application/ports/GradeRepository';

@Injectable()
export class PrismaGradeRepository implements GradeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByCorrection(correctionId: string): Promise<Grade[]> {
    const rows = await this.prisma.grade.findMany({ where: { correctionId } });
    return rows.map((r) => this.toDomain(r));
  }

  async findByExamVersion(examVersionId: string): Promise<Grade[]> {
    const rows = await this.prisma.grade.findMany({ where: { examVersionId } });
    return rows.map((r) => this.toDomain(r));
  }

  async saveMany(grades: Grade[]): Promise<Grade[]> {
    await this.prisma.grade.createMany({
      data: grades.map((g) => ({
        id: g.id,
        studentId: g.studentId,
        examVersionId: g.examVersionId,
        correctionId: g.correctionId,
        score: g.score,
      })),
    });
    return grades;
  }

  private toDomain(row: { id: string; studentId: string; examVersionId: string; correctionId: string; score: unknown }): Grade {
    return {
      id: row.id,
      studentId: row.studentId,
      examVersionId: row.examVersionId,
      correctionId: row.correctionId,
      score: Number(row.score),
    };
  }
}
