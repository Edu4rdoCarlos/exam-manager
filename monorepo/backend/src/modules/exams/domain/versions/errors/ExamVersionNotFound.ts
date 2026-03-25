export class ExamVersionNotFound {
  readonly type = 'ExamVersionNotFound' as const;
  constructor(readonly id: string) {}
}
