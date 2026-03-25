import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ExamVersionResponseDto } from '../dto/ExamVersionResponseDto';

export const CreateExamVersionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new exam version with shuffled questions' }),
    ApiCreatedResponse({ type: ExamVersionResponseDto }),
    ApiNotFoundResponse({ description: 'Exam not found' }),
  );

export const FindExamVersionsByExamDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List all versions for a given exam' }),
    ApiQuery({ name: 'examId', required: true, type: String }),
    ApiOkResponse({ type: ExamVersionResponseDto, isArray: true }),
  );

export const GetExamVersionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get an exam version by ID' }),
    ApiOkResponse({ type: ExamVersionResponseDto }),
    ApiNotFoundResponse({ description: 'Exam version not found' }),
  );
