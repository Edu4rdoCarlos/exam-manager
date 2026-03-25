import { User } from '../../domain/User';

export interface CreateUserData {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(data: CreateUserData): Promise<User>;
}

export const USER_REPOSITORY = Symbol('UserRepository');
