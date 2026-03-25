import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiDataResponse } from '../../../../../shared/utils/swagger';
import { AuthTokenResponseDto } from '../dto/AuthTokenResponseDto';

export const LoginDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Authenticate and receive a JWT token' }),
    ApiDataResponse(AuthTokenResponseDto),
    ApiUnauthorizedResponse({ description: 'Invalid credentials' }),
  );
