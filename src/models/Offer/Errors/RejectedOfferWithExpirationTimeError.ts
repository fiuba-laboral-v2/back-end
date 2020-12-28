export class RejectedOfferWithExpirationTimeError extends Error {
  public static buildMessage() {
    return "A rejected offer must not have its expiration time";
  }

  constructor() {
    super(RejectedOfferWithExpirationTimeError.buildMessage());
  }
}
