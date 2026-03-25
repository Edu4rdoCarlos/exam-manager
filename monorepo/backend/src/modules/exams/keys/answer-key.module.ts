import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { ANSWER_KEY_REPOSITORY } from './application/ports/AnswerKeyRepository';
import { PrismaAnswerKeyRepository } from './infrastructure/persistence/PrismaAnswerKeyRepository';
import { CreateAnswerKeys } from './application/services/CreateAnswerKeys';
import { GetAnswerKeys } from './application/services/GetAnswerKeys';
import { AnswerKeyController } from './presentation/http/AnswerKeyController';

@Module({
  imports: [AuthModule],
  controllers: [AnswerKeyController],
  providers: [
    { provide: ANSWER_KEY_REPOSITORY, useClass: PrismaAnswerKeyRepository },
    CreateAnswerKeys,
    GetAnswerKeys,
  ],
  exports: [ANSWER_KEY_REPOSITORY],
})
export class AnswerKeyModule {}
