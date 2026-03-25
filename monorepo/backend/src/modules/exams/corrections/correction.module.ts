import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ExamModule } from '../exam/exam.module';
import { ExamVersionModule } from '../versions/exam-version.module';
import { AnswerKeyModule } from '../keys/answer-key.module';
import { StudentAnswerModule } from '../student-answer/student-answer.module';
import { GradeModule } from '../grade/grade.module';
import { StudentModule } from '../../students/student.module';
import { CORRECTION_REPOSITORY } from './application/ports/CorrectionRepository';
import { PrismaCorrectionRepository } from './infrastructure/persistence/PrismaCorrectionRepository';
import { CreateCorrection } from './application/services/CreateCorrection';
import { GetCorrection } from './application/services/GetCorrection';
import { ApplyCorrection } from './application/services/ApplyCorrection';
import { CorrectExamFromCsv } from './application/services/CorrectExamFromCsv';
import { CorrectionController } from './presentation/http/CorrectionController';

@Module({
  imports: [AuthModule, ExamModule, ExamVersionModule, AnswerKeyModule, StudentAnswerModule, GradeModule, StudentModule],
  controllers: [CorrectionController],
  providers: [
    { provide: CORRECTION_REPOSITORY, useClass: PrismaCorrectionRepository },
    CreateCorrection,
    GetCorrection,
    ApplyCorrection,
    CorrectExamFromCsv,
  ],
  exports: [CORRECTION_REPOSITORY],
})
export class CorrectionModule {}
