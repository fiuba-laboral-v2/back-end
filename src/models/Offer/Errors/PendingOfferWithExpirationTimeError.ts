export class PendingOfferWithExpirationTimeError extends Error {
  public static buildMessage() {
    return "A pending offer must not have its expiration time";
  }

  constructor() {
    super(PendingOfferWithExpirationTimeError.buildMessage());
  }
}
