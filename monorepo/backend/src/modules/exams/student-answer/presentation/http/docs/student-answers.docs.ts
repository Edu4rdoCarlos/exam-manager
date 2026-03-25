import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import { StudentAnswerResponseDto } from '../dto/StudentAnswerResponseDto';

export const SubmitStudentAnswersDocs = () =>
  applyDecorators(
    ApiOperation({ summary: 'Submit answers for a student on an exam version' }),
    ApiCreatedResponse({ type: StudentAnswerResponseDto, isArray: true }),
  );
