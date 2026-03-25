import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { StudentModule } from './modules/students/student/student.module';
import { QuestionModule } from './modules/exams/question/question.module';
import { ExamModule } from './modules/exams/exam/exam.module';
import { ExamVersionModule } from './modules/exams/versions/exam-version.module';
import { StudentAnswerModule } from './modules/exams/student-answer/student-answer.module';
import { AnswerKeyModule } from './modules/exams/keys/answer-key.module';
import { CorrectionModule } from './modules/exams/corrections/correction.module';
import { GradeModule } from './modules/exams/grade/grade.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    QuestionModule,
    ExamModule,
    ExamVersionModule,
    StudentModule,
    StudentAnswerModule,
    CorrectionModule,
    GradeModule,
    AnswerKeyModule,
  ],
})
export class AppModule {}
