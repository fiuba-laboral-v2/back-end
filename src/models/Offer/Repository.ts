import { Offer, IOffer } from "./index";
import { OfferNotFound } from "./Errors";

export const OfferRepository = {
  create: (attributes: IOffer) => new Offer(attributes).save(),
  findByUuid: async (uuid: string) => {
    const offer = await Offer.findByPk(uuid);
    if (!offer) throw new OfferNotFound(uuid);

    return offer;
  },
  truncate: () => Offer.truncate({ cascade: true })
};
