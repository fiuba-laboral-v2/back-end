export class OfferNotFound extends Error {
  constructor(uuid: string) {
    super(`Offer with uuid: ${uuid} does not exist`);
  }
}
