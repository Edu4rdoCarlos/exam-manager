import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';
import { ApiDataResponse, ApiPaginatedResponse } from '../../../../../../shared/utils/swagger';
import { ExamVersionResponseDto } from '../dto/ExamVersionResponseDto';

export const CreateExamVersionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new exam version with shuffled questions' }),
    ApiDataResponse(ExamVersionResponseDto, 201),
    ApiNotFoundResponse({ description: 'Exam not found' }),
  );

export const FindExamVersionsByExamDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List all versions for a given exam' }),
    ApiQuery({ name: 'examId', required: true, type: String }),
    ApiPaginatedResponse(ExamVersionResponseDto),
  );

export const GetExamVersionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get an exam version by ID' }),
    ApiDataResponse(ExamVersionResponseDto),
    ApiNotFoundResponse({ description: 'Exam version not found' }),
  );
