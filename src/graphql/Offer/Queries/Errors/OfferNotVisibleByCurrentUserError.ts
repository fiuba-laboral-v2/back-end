export class OfferNotVisibleByCurrentUserError extends Error {
  public static buildMessage() {
    return "the current user has no permission to see the offer";
  }

  constructor() {
    super(OfferNotVisibleByCurrentUserError.buildMessage());
  }
}
