export interface TokenPayload {
  readonly sub: string;
  readonly name: string;
  readonly email: string;
}

export interface TokenService {
  sign(payload: TokenPayload): string;
}

export const TOKEN_SERVICE = Symbol('TokenService');
