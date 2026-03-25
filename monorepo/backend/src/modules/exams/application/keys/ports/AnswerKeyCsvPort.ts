export interface AnswerKeyExportData {
  readonly versionNumber: number;
  readonly correctAnswers: string[];
}

export interface AnswerKeyCsvPort {
  generate(data: AnswerKeyExportData): string;
}

export const ANSWER_KEY_CSV_PORT = Symbol('AnswerKeyCsvPort');
