import { Module } from '@nestjs/common';
import { AuthModule } from '../../../auth/auth.module';
import { STUDENT_REPOSITORY } from './application/ports/StudentRepository';
import { PrismaStudentRepository } from './infrastructure/persistence/PrismaStudentRepository';
import { CreateStudent } from './application/services/CreateStudent';
import { GetStudent } from './application/services/GetStudent';
import { StudentController } from './presentation/http/StudentController';

@Module({
  imports: [AuthModule],
  controllers: [StudentController],
  providers: [
    { provide: STUDENT_REPOSITORY, useClass: PrismaStudentRepository },
    CreateStudent,
    GetStudent,
  ],
  exports: [GetStudent],
})
export class StudentModule {}
