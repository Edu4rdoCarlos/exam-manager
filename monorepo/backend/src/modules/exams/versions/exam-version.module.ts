import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ExamModule } from '../exam/exam.module';
import { QuestionModule } from '../question/question.module';
import { EXAM_VERSION_REPOSITORY } from './application/ports/ExamVersionRepository';
import { EXAM_PDF_PORT } from './application/ports/ExamPdfPort';
import { PrismaExamVersionRepository } from './infrastructure/persistence/PrismaExamVersionRepository';
import { PdfMakeExamPdfAdapter } from './infrastructure/pdf/PdfMakeExamPdfAdapter';
import { CreateExamVersion } from './application/services/CreateExamVersion';
import { GetExamVersion } from './application/services/GetExamVersion';
import { GenerateExamVersionPdf } from './application/services/GenerateExamVersionPdf';
import { ExamVersionController } from './presentation/http/ExamVersionController';

@Module({
  imports: [AuthModule, ExamModule, QuestionModule],
  controllers: [ExamVersionController],
  providers: [
    { provide: EXAM_VERSION_REPOSITORY, useClass: PrismaExamVersionRepository },
    { provide: EXAM_PDF_PORT, useClass: PdfMakeExamPdfAdapter },
    CreateExamVersion,
    GetExamVersion,
    GenerateExamVersionPdf,
  ],
  exports: [GetExamVersion, EXAM_VERSION_REPOSITORY],
})
export class ExamVersionModule {}
