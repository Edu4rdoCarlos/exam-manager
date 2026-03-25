export interface Alternative {
  readonly id: string;
  readonly questionId: string;
  readonly description: string;
  readonly isCorrect: boolean;
}

export interface Question {
  readonly id: string;
  readonly statement: string;
  readonly createdAt: Date | null;
  readonly updatedAt: Date | null;
  readonly alternatives: Alternative[];
}
