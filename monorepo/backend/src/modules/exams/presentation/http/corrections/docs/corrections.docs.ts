import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiNotFoundResponse, getSchemaPath } from '@nestjs/swagger';
import { ApiDataResponse } from '../../../../../../shared/utils/swagger';
import { CorrectionResponseDto, ApplyCorrectionResponseDto } from '../dto/CorrectionResponseDto';

export const CreateCorrectionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Create a correction for an exam' }),
    ApiDataResponse(CorrectionResponseDto, 201),
    ApiNotFoundResponse({ description: 'Exam not found' }),
  );

export const GetCorrectionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get a correction by ID' }),
    ApiDataResponse(CorrectionResponseDto),
    ApiNotFoundResponse({ description: 'Correction not found' }),
  );

export const ApplyCorrectionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Apply correction and compute grades for all students' }),
    ApiDataResponse(ApplyCorrectionResponseDto),
    ApiNotFoundResponse({ description: 'Correction not found' }),
  );

export const ApplyFromCsvDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Import student answers from CSV and apply correction' }),
    ApiDataResponse(ApplyCorrectionResponseDto),
    ApiNotFoundResponse({ description: 'Correction or student not found' }),
  );

export const GetCorrectionsByExamDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'List all corrections for a given exam' }),
    ApiExtraModels(CorrectionResponseDto),
    ApiOkResponse({
      schema: {
        properties: {
          data: { type: 'array', items: { $ref: getSchemaPath(CorrectionResponseDto) } },
        },
      },
    }),
  );
