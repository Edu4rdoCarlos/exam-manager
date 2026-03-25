import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export interface JwtPayload {
  readonly sub: string;
  readonly email: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const token = this.extractBearerToken(request);
    if (!token) throw new UnauthorizedException();

    try {
      request.user = this.jwtService.verify<JwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractBearerToken(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
