export class OfferWithNoCareersError extends Error {
  public static buildMessage() {
    return "The offer must have at least one career";
  }

  constructor() {
    super(OfferWithNoCareersError.buildMessage());
  }
}
