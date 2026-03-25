import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { GRADE_REPOSITORY } from './application/ports/GradeRepository';
import { PrismaGradeRepository } from './infrastructure/persistence/PrismaGradeRepository';
import { GetGrades } from './application/services/GetGrades';
import { GradeController } from './presentation/http/GradeController';

@Module({
  imports: [AuthModule],
  controllers: [GradeController],
  providers: [
    { provide: GRADE_REPOSITORY, useClass: PrismaGradeRepository },
    GetGrades,
  ],
  exports: [GRADE_REPOSITORY],
})
export class GradeModule {}
