import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiConflictResponse, ApiNotFoundResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiDataResponse } from '../../../../../shared/utils/swagger';
import { UserResponseDto } from '../dto/UserResponseDto';
import { UserMeResponseDto } from '../dto/UserMeResponseDto';

export const CreateUserDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new user' }),
    ApiDataResponse(UserResponseDto, 201),
    ApiConflictResponse({ description: 'Email already in use' }),
  );

export const GetUserDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get the authenticated user profile',
      description: 'Returns the profile of the currently authenticated teacher, including the list of exams they have created.',
    }),
    ApiDataResponse(UserMeResponseDto),
    ApiNotFoundResponse({ description: 'User not found' }),
  );
