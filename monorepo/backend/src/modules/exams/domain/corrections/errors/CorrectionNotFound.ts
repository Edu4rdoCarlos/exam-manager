export class CorrectionNotFound {
  readonly type = 'CorrectionNotFound' as const;
  constructor(readonly id: string) {}
}
