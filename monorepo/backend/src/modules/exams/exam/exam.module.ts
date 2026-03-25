import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { EXAM_REPOSITORY } from './application/ports/ExamRepository';
import { PrismaExamRepository } from './infrastructure/persistence/PrismaExamRepository';
import { CreateExam } from './application/services/CreateExam';
import { GetExam } from './application/services/GetExam';
import { ExamController } from './presentation/http/ExamController';

@Module({
  imports: [AuthModule],
  controllers: [ExamController],
  providers: [
    { provide: EXAM_REPOSITORY, useClass: PrismaExamRepository },
    CreateExam,
    GetExam,
  ],
  exports: [GetExam, EXAM_REPOSITORY],
})
export class ExamModule {}
