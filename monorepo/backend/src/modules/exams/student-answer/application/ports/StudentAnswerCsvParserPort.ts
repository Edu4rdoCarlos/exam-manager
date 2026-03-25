export interface ParsedStudentAnswerRow {
  readonly cpf: string;
  readonly examVersionId: string;
  readonly answers: readonly string[];
}

export interface StudentAnswerCsvParserPort {
  parse(csvContent: string): ParsedStudentAnswerRow[];
}

export const STUDENT_ANSWER_CSV_PARSER_PORT = Symbol('StudentAnswerCsvParserPort');
