import { Injectable } from '@nestjs/common';
import { CorrectionMode } from '@exam-manager/database';
import { PrismaService } from '../../../../../shared/database/prisma.service';
import { Correction } from '../../domain/Correction';
import { CorrectionRepository } from '../../application/ports/CorrectionRepository';

@Injectable()
export class PrismaCorrectionRepository implements CorrectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Correction | null> {
    const row = await this.prisma.correction.findUnique({ where: { id } });
    if (!row) return null;
    return { ...row, correctionMode: row.correctionMode as Correction['correctionMode'] };
  }

  async save(correction: Correction): Promise<Correction> {
    const row = await this.prisma.correction.upsert({
      where: { id: correction.id },
      create: {
        id: correction.id,
        examId: correction.examId,
        correctionMode: correction.correctionMode as CorrectionMode,
      },
      update: {
        correctionMode: correction.correctionMode as CorrectionMode,
      },
    });
    return { ...row, correctionMode: row.correctionMode as Correction['correctionMode'] };
  }
}
