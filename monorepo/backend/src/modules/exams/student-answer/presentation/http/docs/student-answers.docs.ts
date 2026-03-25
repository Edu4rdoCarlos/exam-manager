import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../../../../../../shared/utils/swagger';
import { StudentAnswerResponseDto } from '../dto/StudentAnswerResponseDto';

export const SubmitStudentAnswersDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Submit answers for a student on an exam version' }),
    ApiPaginatedResponse(StudentAnswerResponseDto, 201),
  );
