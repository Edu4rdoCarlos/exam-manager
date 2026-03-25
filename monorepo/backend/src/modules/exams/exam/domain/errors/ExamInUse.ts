export class ExamInUse {
  readonly type = 'ExamInUse' as const;
  constructor(readonly id: string) {}
}
