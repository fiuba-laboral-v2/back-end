import { Offer, IOffer } from "./index";
import { OfferNotFound } from "./Errors";

export const OfferRepository = {
  create: (attributes: IOffer) => {
    return new Offer({ ...attributes }).save();
  },
  findByUuid: async (uuid: string) => {
    const offer = await Offer.findByPk(uuid);
    if (!offer) throw new OfferNotFound(uuid);

    return offer;
  },
  truncate: async () => {
    return Offer.truncate({ cascade: true });
  }
};
