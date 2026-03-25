import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiNotFoundResponse, ApiConflictResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { ApiDataResponse, ApiPaginatedResponse } from '../../../../../../shared/utils/swagger';
import { QuestionResponseDto } from '../dto/QuestionResponseDto';

export const CreateQuestionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new question with alternatives' }),
    ApiDataResponse(QuestionResponseDto, 201),
  );

export const GetAllQuestionsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List all questions' }),
    ApiPaginatedResponse(QuestionResponseDto),
  );

export const GetQuestionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a question by ID' }),
    ApiDataResponse(QuestionResponseDto),
    ApiNotFoundResponse({ description: 'Question not found' }),
  );

export const UpdateQuestionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Update a question statement and/or alternatives' }),
    ApiDataResponse(QuestionResponseDto),
    ApiNotFoundResponse({ description: 'Question not found' }),
  );

export const DeleteQuestionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Delete a question' }),
    ApiNoContentResponse({ description: 'Question deleted' }),
    ApiNotFoundResponse({ description: 'Question not found' }),
    ApiConflictResponse({ description: 'Question is already used in an exam' }),
  );
