export class AttributeNotDefinedError extends Error {
  public static buildMessage(attributeName: string) {
    return `The attribute ${attributeName} must be defined`;
  }

  constructor(attributeName: string) {
    super(AttributeNotDefinedError.buildMessage(attributeName));
  }
}
