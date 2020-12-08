export class UnknownEmailSenderError extends Error {
  public static buildMessage(className: string) {
    return `No emailSender found for ${className}`;
  }

  constructor(className: string) {
    super(UnknownEmailSenderError.buildMessage(className));
  }
}
