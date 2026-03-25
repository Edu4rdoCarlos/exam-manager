import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { EXAM_REPOSITORY } from './application/ports/ExamRepository';
import { PrismaExamRepository } from './infrastructure/persistence/PrismaExamRepository';
import { CreateExam } from './application/services/CreateExam';
import { GetExam } from './application/services/GetExam';
import { UpdateExam } from './application/services/UpdateExam';
import { DeleteExam } from './application/services/DeleteExam';
import { ExamController } from './presentation/http/ExamController';

@Module({
  imports: [AuthModule],
  controllers: [ExamController],
  providers: [
    { provide: EXAM_REPOSITORY, useClass: PrismaExamRepository },
    CreateExam,
    GetExam,
    UpdateExam,
    DeleteExam,
  ],
  exports: [GetExam, EXAM_REPOSITORY],
})
export class ExamModule {}
