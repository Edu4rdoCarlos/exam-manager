import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { QUESTION_REPOSITORY } from './application/ports/QuestionRepository';
import { PrismaQuestionRepository } from './infrastructure/persistence/PrismaQuestionRepository';
import { CreateQuestion } from './application/services/CreateQuestion';
import { GetQuestion } from './application/services/GetQuestion';
import { GetAllQuestions } from './application/services/GetAllQuestions';
import { UpdateQuestion } from './application/services/UpdateQuestion';
import { DeleteQuestion } from './application/services/DeleteQuestion';
import { QuestionController } from './presentation/http/QuestionController';

@Module({
  imports: [AuthModule],
  controllers: [QuestionController],
  providers: [
    { provide: QUESTION_REPOSITORY, useClass: PrismaQuestionRepository },
    CreateQuestion,
    GetQuestion,
    GetAllQuestions,
    UpdateQuestion,
    DeleteQuestion,
  ],
  exports: [GetQuestion, QUESTION_REPOSITORY],
})
export class QuestionModule {}
