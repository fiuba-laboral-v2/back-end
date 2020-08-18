export class OfferNotUpdatedError extends Error {
  public static buildMessage(uuid: string) {
    return `Offer with uuid: ${uuid} could not be updated`;
  }

  constructor(uuid: string) {
    super(OfferNotUpdatedError.buildMessage(uuid));
  }
}
