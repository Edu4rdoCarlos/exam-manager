import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { User } from '../../domain/User';
import { CreateUserData, UserRepository } from '../../application/ports/UserRepository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async save(data: CreateUserData): Promise<User> {
    const passwordHash = createHash('sha256').update(data.password).digest('hex');
    const row = await this.prisma.user.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        passwordHash,
      },
    });
    return this.toDomain(row);
  }

  private toDomain(row: { id: string; name: string; email: string; passwordHash: string; createdAt: Date | null }): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      createdAt: row.createdAt,
    };
  }
}
