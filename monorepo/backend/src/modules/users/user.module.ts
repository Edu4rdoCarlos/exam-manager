import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExamsModule } from '../exams/exams.module';
import { USER_REPOSITORY } from './application/ports/UserRepository';
import { PrismaUserRepository } from './infrastructure/persistence/PrismaUserRepository';
import { CreateUser } from './application/services/CreateUser';
import { GetUser } from './application/services/GetUser';
import { UserController } from './presentation/http/UserController';

@Module({
  imports: [AuthModule, ExamsModule],
  controllers: [UserController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    CreateUser,
    GetUser,
  ],
  exports: [GetUser],
})
export class UserModule {}
