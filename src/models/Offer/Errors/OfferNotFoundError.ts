export class OfferNotFoundError extends Error {
  public static buildMessage(uuid: string) {
    return `Offer with uuid: ${uuid} does not exist`;
  }

  constructor(uuid: string) {
    super(OfferNotFoundError.buildMessage(uuid));
  }
}
