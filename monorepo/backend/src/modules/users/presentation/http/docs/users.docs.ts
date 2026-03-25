import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserResponseDto } from '../dto/UserResponseDto';

export const CreateUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiCreatedResponse({ type: UserResponseDto }),
    ApiConflictResponse({ description: 'Email already in use' }),
  );

export const GetUserDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get a user by ID' }),
    ApiOkResponse({ type: UserResponseDto }),
    ApiNotFoundResponse({ description: 'User not found' }),
  );
