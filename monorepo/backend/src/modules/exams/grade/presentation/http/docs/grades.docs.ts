import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { GradeResponseDto } from '../dto/GradeResponseDto';

export const GetGradesByExamVersionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all grades for an exam version' }),
    ApiOkResponse({ type: GradeResponseDto, isArray: true }),
  );

export const GetGradesByCorrectionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all grades produced by a correction' }),
    ApiOkResponse({ type: GradeResponseDto, isArray: true }),
  );
