export class OfferNotFound extends Error {
  constructor(uuid: string) {
    super(`offer with uuid: ${uuid} does not exists`);
  }
}
