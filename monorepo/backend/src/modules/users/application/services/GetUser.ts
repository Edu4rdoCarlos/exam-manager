import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/User';
import { UserRepository, USER_REPOSITORY } from '../ports/UserRepository';
import { UserNotFound } from '../../domain/errors/UserNotFound';
import { Result, success, failure } from '../../../../shared/result';

@Injectable()
export class GetUser {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<Result<User, UserNotFound>> {
    const user = await this.userRepository.findById(id);
    if (!user) return failure(new UserNotFound(id));
    return success(user);
  }
}
