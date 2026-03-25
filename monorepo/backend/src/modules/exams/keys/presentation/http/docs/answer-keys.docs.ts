import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../../../../../shared/utils/swagger';
import { AnswerKeyResponseDto } from '../dto/AnswerKeyResponseDto';

export const CreateAnswerKeysDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create answer keys for an exam version' }),
    ApiPaginatedResponse(AnswerKeyResponseDto, 201),
  );

export const GetAnswerKeysDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all answer keys for an exam version' }),
    ApiPaginatedResponse(AnswerKeyResponseDto),
  );

export const ExportAnswerKeysCsvDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Export answer keys for an exam version as CSV' }),
    ApiOkResponse({ description: 'CSV file', content: { 'text/csv': { schema: { type: 'string' } } } }),
    ApiNotFoundResponse({ description: 'Exam version not found' }),
  );
