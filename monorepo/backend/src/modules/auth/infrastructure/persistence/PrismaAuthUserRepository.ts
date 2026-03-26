import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { AuthUser, AuthUserRepository } from '../../application/ports/AuthUserRepository';

@Injectable()
export class PrismaAuthUserRepository implements AuthUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    if (!row) return null;
    return { id: row.id, name: row.name, email: row.email, passwordHash: row.passwordHash };
  }
}
