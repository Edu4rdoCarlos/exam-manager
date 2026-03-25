export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
}

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
}

export const AUTH_USER_REPOSITORY = Symbol('AuthUserRepository');
