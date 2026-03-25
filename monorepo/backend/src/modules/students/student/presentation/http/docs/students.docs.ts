import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiConflictResponse, ApiNotFoundResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiDataResponse } from '../../../../../../shared/utils/swagger';
import { StudentResponseDto } from '../dto/StudentResponseDto';

export const CreateStudentDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Register a new student' }),
    ApiDataResponse(StudentResponseDto, 201),
    ApiConflictResponse({ description: 'CPF already in use' }),
  );

export const GetStudentDocs = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get a student by ID' }),
    ApiDataResponse(StudentResponseDto),
    ApiNotFoundResponse({ description: 'Student not found' }),
  );
