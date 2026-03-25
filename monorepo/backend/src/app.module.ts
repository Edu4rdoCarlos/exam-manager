import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/user.module';
import { StudentModule } from './modules/students/student.module';
import { ExamsModule } from './modules/exams/exams.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    StudentModule,
    ExamsModule,
  ],
})
export class AppModule {}
