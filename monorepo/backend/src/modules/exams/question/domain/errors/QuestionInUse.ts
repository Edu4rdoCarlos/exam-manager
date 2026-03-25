export class QuestionInUse {
  readonly type = 'QuestionInUse' as const;
  constructor(readonly id: string) {}
}
