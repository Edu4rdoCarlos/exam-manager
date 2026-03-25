import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { STUDENT_ANSWER_REPOSITORY } from './application/ports/StudentAnswerRepository';
import { STUDENT_ANSWER_CSV_PARSER_PORT } from './application/ports/StudentAnswerCsvParserPort';
import { PrismaStudentAnswerRepository } from './infrastructure/persistence/PrismaStudentAnswerRepository';
import { CsvStudentAnswerParserAdapter } from './infrastructure/csv/CsvStudentAnswerParserAdapter';
import { SubmitStudentAnswers } from './application/services/SubmitStudentAnswers';
import { StudentAnswerController } from './presentation/http/StudentAnswerController';

@Module({
  imports: [AuthModule],
  controllers: [StudentAnswerController],
  providers: [
    { provide: STUDENT_ANSWER_REPOSITORY, useClass: PrismaStudentAnswerRepository },
    { provide: STUDENT_ANSWER_CSV_PARSER_PORT, useClass: CsvStudentAnswerParserAdapter },
    SubmitStudentAnswers,
  ],
  exports: [STUDENT_ANSWER_REPOSITORY, STUDENT_ANSWER_CSV_PARSER_PORT],
})
export class StudentAnswerModule {}
