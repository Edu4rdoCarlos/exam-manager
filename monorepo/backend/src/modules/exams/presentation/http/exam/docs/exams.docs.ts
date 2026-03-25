import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOperation } from '@nestjs/swagger';
import { ApiDataResponse } from '../../../../../../shared/utils/swagger';
import { ExamResponseDto } from '../dto/ExamResponseDto';

export const CreateExamDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new exam' }),
    ApiDataResponse(ExamResponseDto, 201),
  );

export const GetExamDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get an exam by ID' }),
    ApiDataResponse(ExamResponseDto),
    ApiNotFoundResponse({ description: 'Exam not found' }),
  );

export const UpdateExamDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update an exam' }),
    ApiDataResponse(ExamResponseDto),
    ApiNotFoundResponse({ description: 'Exam not found' }),
  );

export const DeleteExamDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete an exam' }),
    ApiNoContentResponse({ description: 'Exam deleted' }),
    ApiNotFoundResponse({ description: 'Exam not found' }),
    ApiConflictResponse({ description: 'Exam has existing versions and cannot be deleted' }),
  );
