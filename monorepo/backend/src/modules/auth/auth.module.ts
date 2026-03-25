import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AUTH_USER_REPOSITORY } from './application/ports/AuthUserRepository';
import { TOKEN_SERVICE } from './application/ports/TokenService';
import { Login } from './application/services/Login';
import { PrismaAuthUserRepository } from './infrastructure/persistence/PrismaAuthUserRepository';
import { JwtTokenService } from './infrastructure/jwt/JwtTokenService';
import { JwtAuthGuard } from './infrastructure/guards/JwtAuthGuard';
import { AuthController } from './presentation/http/AuthController';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: AUTH_USER_REPOSITORY, useClass: PrismaAuthUserRepository },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    Login,
    JwtAuthGuard,
  ],
  exports: [JwtModule, JwtAuthGuard],
})
export class AuthModule {}
