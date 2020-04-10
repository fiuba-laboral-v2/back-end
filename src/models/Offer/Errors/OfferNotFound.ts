export class OfferNotFound extends Error {
  public static buildMessage(uuid: string) {
    return `Offer with uuid: ${uuid} does not exist`;
  }

  constructor(uuid: string) {
    super(OfferNotFound.buildMessage(uuid));
  }
}
