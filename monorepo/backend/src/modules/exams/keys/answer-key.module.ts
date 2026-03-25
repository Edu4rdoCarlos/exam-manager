import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ExamVersionModule } from '../versions/exam-version.module';
import { ANSWER_KEY_REPOSITORY } from './application/ports/AnswerKeyRepository';
import { ANSWER_KEY_CSV_PORT } from './application/ports/AnswerKeyCsvPort';
import { PrismaAnswerKeyRepository } from './infrastructure/persistence/PrismaAnswerKeyRepository';
import { CsvAnswerKeyExportAdapter } from './infrastructure/csv/CsvAnswerKeyExportAdapter';
import { CreateAnswerKeys } from './application/services/CreateAnswerKeys';
import { GetAnswerKeys } from './application/services/GetAnswerKeys';
import { ExportAnswerKeyCsv } from './application/services/ExportAnswerKeyCsv';
import { AnswerKeyController } from './presentation/http/AnswerKeyController';

@Module({
  imports: [AuthModule, ExamVersionModule],
  controllers: [AnswerKeyController],
  providers: [
    { provide: ANSWER_KEY_REPOSITORY, useClass: PrismaAnswerKeyRepository },
    { provide: ANSWER_KEY_CSV_PORT, useClass: CsvAnswerKeyExportAdapter },
    CreateAnswerKeys,
    GetAnswerKeys,
    ExportAnswerKeyCsv,
  ],
  exports: [ANSWER_KEY_REPOSITORY],
})
export class AnswerKeyModule {}
