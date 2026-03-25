import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CorrectionResponseDto, ApplyCorrectionResponseDto } from '../dto/CorrectionResponseDto';

export const CreateCorrectionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a correction for an exam' }),
    ApiCreatedResponse({ type: CorrectionResponseDto }),
    ApiNotFoundResponse({ description: 'Exam not found' }),
  );

export const GetCorrectionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a correction by ID' }),
    ApiOkResponse({ type: CorrectionResponseDto }),
    ApiNotFoundResponse({ description: 'Correction not found' }),
  );

export const ApplyCorrectionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Apply correction and compute grades for all students' }),
    ApiOkResponse({ type: ApplyCorrectionResponseDto }),
    ApiNotFoundResponse({ description: 'Correction not found' }),
  );
