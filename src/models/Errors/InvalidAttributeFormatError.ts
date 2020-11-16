export class InvalidAttributeFormatError extends Error {
  public static buildMessage(attributeName: string) {
    return `The attribute ${attributeName} has an invalid format`;
  }

  constructor(attributeName: string) {
    super(InvalidAttributeFormatError.buildMessage(attributeName));
  }
}
