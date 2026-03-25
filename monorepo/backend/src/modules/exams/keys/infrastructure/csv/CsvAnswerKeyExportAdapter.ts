import { Injectable } from '@nestjs/common';
import { AnswerKeyExportData, AnswerKeyCsvPort } from '../../application/ports/AnswerKeyCsvPort';

@Injectable()
export class CsvAnswerKeyExportAdapter implements AnswerKeyCsvPort {
  generate(data: AnswerKeyExportData): string {
    const headers = ['version', ...data.correctAnswers.map((_, i) => `q${i + 1}`)];
    const row = [String(data.versionNumber), ...data.correctAnswers];
    return [headers.join(','), row.join(',')].join('\n');
  }
}
