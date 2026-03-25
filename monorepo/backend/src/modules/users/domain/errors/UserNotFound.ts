export class UserNotFound {
  readonly type = 'UserNotFound' as const;
  constructor(readonly id: string) {}
}
