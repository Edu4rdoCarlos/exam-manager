import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { Student } from '../../domain/Student';
import { StudentRepository } from '../../application/ports/StudentRepository';

@Injectable()
export class PrismaStudentRepository implements StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Student[]> {
    const rows = await this.prisma.student.findMany();
    return rows.map((row) => this.toDomain(row));
  }

  async findAllPaginated(page: number, perPage: number): Promise<{ students: Student[]; totalItems: number }> {
    const [rows, totalItems] = await Promise.all([
      this.prisma.student.findMany({ skip: (page - 1) * perPage, take: perPage }),
      this.prisma.student.count(),
    ]);
    return { students: rows.map((row) => this.toDomain(row)), totalItems };
  }

  async findById(id: string): Promise<Student | null> {
    const row = await this.prisma.student.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByCpf(cpf: string): Promise<Student | null> {
    const row = await this.prisma.student.findUnique({ where: { cpf } });
    return row ? this.toDomain(row) : null;
  }

  async save(student: Student): Promise<Student> {
    const row = await this.prisma.student.upsert({
      where: { id: student.id },
      create: { id: student.id, name: student.name, cpf: student.cpf },
      update: { name: student.name },
    });
    return this.toDomain(row);
  }

  private toDomain(row: { id: string; name: string; cpf: string }): Student {
    return { id: row.id, name: row.name, cpf: row.cpf };
  }
}
