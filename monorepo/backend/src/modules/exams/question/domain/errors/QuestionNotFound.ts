export class QuestionNotFound {
  readonly type = 'QuestionNotFound' as const;
  constructor(readonly id: string) {}
}
