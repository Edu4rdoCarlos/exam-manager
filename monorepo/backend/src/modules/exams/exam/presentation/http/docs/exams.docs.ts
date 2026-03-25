import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ExamResponseDto } from '../dto/ExamResponseDto';

export const CreateExamDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new exam' }),
    ApiCreatedResponse({ type: ExamResponseDto }),
  );

export const GetExamDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get an exam by ID' }),
    ApiOkResponse({ type: ExamResponseDto }),
    ApiNotFoundResponse({ description: 'Exam not found' }),
  );
