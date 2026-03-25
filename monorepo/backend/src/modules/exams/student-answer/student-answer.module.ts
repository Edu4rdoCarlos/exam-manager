import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { STUDENT_ANSWER_REPOSITORY } from './application/ports/StudentAnswerRepository';
import { PrismaStudentAnswerRepository } from './infrastructure/persistence/PrismaStudentAnswerRepository';
import { SubmitStudentAnswers } from './application/services/SubmitStudentAnswers';
import { StudentAnswerController } from './presentation/http/StudentAnswerController';

@Module({
  imports: [AuthModule],
  controllers: [StudentAnswerController],
  providers: [
    { provide: STUDENT_ANSWER_REPOSITORY, useClass: PrismaStudentAnswerRepository },
    SubmitStudentAnswers,
  ],
  exports: [STUDENT_ANSWER_REPOSITORY],
})
export class StudentAnswerModule {}
