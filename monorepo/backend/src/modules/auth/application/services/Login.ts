import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthToken } from '../../domain/AuthToken';
import { InvalidCredentials } from '../../domain/errors/InvalidCredentials';
import { AuthUserRepository, AUTH_USER_REPOSITORY } from '../ports/AuthUserRepository';
import { TokenService, TOKEN_SERVICE } from '../ports/TokenService';
import { Result, success, failure } from '../../../../shared/result';

export interface LoginInput {
  readonly email: string;
  readonly password: string;
}

@Injectable()
export class Login {
  constructor(
    @Inject(AUTH_USER_REPOSITORY) private readonly authUserRepository: AuthUserRepository,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<Result<AuthToken, InvalidCredentials>> {
    const user = await this.authUserRepository.findByEmail(input.email);
    if (!user) return failure(new InvalidCredentials());

    const hash = createHash('sha256').update(input.password).digest('hex');
    if (hash !== user.passwordHash) return failure(new InvalidCredentials());

    const accessToken = this.tokenService.sign({ sub: user.id, email: user.email });
    return success({ accessToken });
  }
}
