import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../../../../../shared/utils/swagger';
import { GradeResponseDto } from '../dto/GradeResponseDto';

export const GetGradesByExamVersionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all grades for an exam version' }),
    ApiPaginatedResponse(GradeResponseDto),
  );

export const GetGradesByCorrectionDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Get all grades produced by a correction' }),
    ApiPaginatedResponse(GradeResponseDto),
  );
