import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiNotFoundResponse } from '@nestjs/swagger';
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
