import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthTokenResponseDto } from '../dto/AuthTokenResponseDto';

export const LoginDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Authenticate and receive a JWT token' }),
    ApiOkResponse({ type: AuthTokenResponseDto }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
  );
