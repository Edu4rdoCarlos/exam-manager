import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '../../domain/User';
import { EmailAlreadyInUse } from '../../domain/errors/EmailAlreadyInUse';
import { UserRepository, USER_REPOSITORY } from '../ports/UserRepository';
import { Result, success, failure } from '../../../../shared/result';

export interface CreateUserInput {
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

@Injectable()
export class CreateUser {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateUserInput): Promise<Result<User, EmailAlreadyInUse>> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) return failure(new EmailAlreadyInUse());

    const saved = await this.userRepository.save({
      id: randomUUID(),
      name: input.name,
      email: input.email,
      password: input.password,
    });
    return success(saved);
  }
}
