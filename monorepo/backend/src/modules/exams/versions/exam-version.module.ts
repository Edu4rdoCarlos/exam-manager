import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ExamModule } from '../exam/exam.module';
import { EXAM_VERSION_REPOSITORY } from './application/ports/ExamVersionRepository';
import { PrismaExamVersionRepository } from './infrastructure/persistence/PrismaExamVersionRepository';
import { CreateExamVersion } from './application/services/CreateExamVersion';
import { GetExamVersion } from './application/services/GetExamVersion';
import { ExamVersionController } from './presentation/http/ExamVersionController';

@Module({
  imports: [AuthModule, ExamModule],
  controllers: [ExamVersionController],
  providers: [
    { provide: EXAM_VERSION_REPOSITORY, useClass: PrismaExamVersionRepository },
    CreateExamVersion,
    GetExamVersion,
  ],
  exports: [GetExamVersion, EXAM_VERSION_REPOSITORY],
})
export class ExamVersionModule {}
