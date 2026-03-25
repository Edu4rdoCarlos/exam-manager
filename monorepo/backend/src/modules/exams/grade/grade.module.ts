import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ExamModule } from '../exam/exam.module';
import { ExamVersionModule } from '../versions/exam-version.module';
import { StudentModule } from '../../students/student.module';
import { GRADE_REPOSITORY } from './application/ports/GradeRepository';
import { PrismaGradeRepository } from './infrastructure/persistence/PrismaGradeRepository';
import { GetGrades } from './application/services/GetGrades';
import { GetGradeReport } from './application/services/GetGradeReport';
import { GradeController } from './presentation/http/GradeController';

@Module({
  imports: [AuthModule, ExamModule, ExamVersionModule, StudentModule],
  controllers: [GradeController],
  providers: [
    { provide: GRADE_REPOSITORY, useClass: PrismaGradeRepository },
    GetGrades,
    GetGradeReport,
  ],
  exports: [GRADE_REPOSITORY],
})
export class GradeModule {}
