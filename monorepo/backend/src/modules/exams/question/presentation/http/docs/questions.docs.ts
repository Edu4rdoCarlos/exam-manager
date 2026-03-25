import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { QuestionResponseDto } from '../dto/QuestionResponseDto';

export const CreateQuestionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a new question with alternatives' }),
    ApiCreatedResponse({ type: QuestionResponseDto }),
  );

export const GetAllQuestionsDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List all questions' }),
    ApiOkResponse({ type: QuestionResponseDto, isArray: true }),
  );

export const GetQuestionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a question by ID' }),
    ApiOkResponse({ type: QuestionResponseDto }),
    ApiNotFoundResponse({ description: 'Question not found' }),
  );
