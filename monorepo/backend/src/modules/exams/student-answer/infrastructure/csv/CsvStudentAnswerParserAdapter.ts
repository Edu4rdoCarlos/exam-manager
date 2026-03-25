import { Injectable } from '@nestjs/common';
import { ParsedStudentAnswerRow, StudentAnswerCsvParserPort } from '../../application/ports/StudentAnswerCsvParserPort';

@Injectable()
export class CsvStudentAnswerParserAdapter implements StudentAnswerCsvParserPort {
  parse(csvContent: string): ParsedStudentAnswerRow[] {
    const lines = csvContent.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) return [];

    return lines.slice(1).map((line) => {
      const columns = line.split(',');
      const cpf = columns[0] ?? '';
      const examVersionId = columns[1] ?? '';
      const answers = columns.slice(2);
      return { cpf, examVersionId, answers };
    });
  }
}
