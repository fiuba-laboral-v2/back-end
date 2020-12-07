export class UnknownRepositoryError extends Error {
  public static buildMessage(className: string) {
    return `No repository found for ${className}`;
  }

  constructor(className: string) {
    super(UnknownRepositoryError.buildMessage(className));
  }
}
