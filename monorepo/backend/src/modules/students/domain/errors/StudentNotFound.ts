export class StudentNotFound {
  readonly type = 'StudentNotFound' as const;
  constructor(readonly id: string) {}
}
