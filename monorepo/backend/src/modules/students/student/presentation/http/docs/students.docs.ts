import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentResponseDto } from '../dto/StudentResponseDto';

export const CreateStudentDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new student' }),
    ApiCreatedResponse({ type: StudentResponseDto }),
    ApiConflictResponse({ description: 'CPF already in use' }),
  );

export const GetStudentDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get a student by ID' }),
    ApiOkResponse({ type: StudentResponseDto }),
    ApiNotFoundResponse({ description: 'Student not found' }),
  );
