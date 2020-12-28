export class ApprovedOfferWithNoExpirationTimeError extends Error {
  public static buildMessage() {
    return "An approved offer must have its expiration time";
  }

  constructor() {
    super(ApprovedOfferWithNoExpirationTimeError.buildMessage());
  }
}
