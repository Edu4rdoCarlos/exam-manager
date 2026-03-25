import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiConflictResponse, ApiNotFoundResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiDataResponse } from '../../../../../shared/utils/swagger';
import { UserResponseDto } from '../dto/UserResponseDto';

export const CreateUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiDataResponse(UserResponseDto, 201),
    ApiConflictResponse({ description: 'Email already in use' }),
  );

export const GetUserDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get a user by ID' }),
    ApiDataResponse(UserResponseDto),
    ApiNotFoundResponse({ description: 'User not found' }),
  );
