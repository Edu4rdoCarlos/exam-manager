export class ExamNotFound {
  readonly type = 'ExamNotFound' as const;
  constructor(readonly id: string) {}
}
