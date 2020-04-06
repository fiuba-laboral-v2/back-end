import { Offer, IOffer } from "./index";
import { OfferNotFound } from "./Errors";

export const OfferRepository = {
  create: async (attributes: IOffer) => {
    const company = new Offer({ ...attributes });
    return OfferRepository.save(company);
  },
  save: async (offer: Offer) => {
    return offer.save();
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
