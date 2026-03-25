import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AnswerKeyResponseDto } from '../dto/AnswerKeyResponseDto';

export const CreateAnswerKeysDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create answer keys for an exam version' }),
    ApiCreatedResponse({ type: AnswerKeyResponseDto, isArray: true }),
  );

export const GetAnswerKeysDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all answer keys for an exam version' }),
    ApiOkResponse({ type: AnswerKeyResponseDto, isArray: true }),
  );
