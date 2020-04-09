import Database from "../../config/Database";
import { Offer, IOffer } from "./";
import { OfferSection, IOfferSection } from "./OfferSection";
import { OfferNotFound } from "./Errors";

export const OfferRepository = {
  create: (
    {
      sections = [],
      ...attributes
    }: IOffer) => {
    const offer = new Offer(attributes);
    return OfferRepository.save(offer, sections);
  },
  save: async (offer: Offer, sections: IOfferSection[] = []) => {
    const transaction = await Database.transaction();
    try {
      await offer.save({ transaction });
      await Promise.all(sections.map(section => (
        OfferSection.create({ ...section, offerUuid: offer.uuid }, { transaction })
      )));
      await transaction.commit();
      return offer;
    } catch (e) {
      await transaction.rollback();
      throw new Error(e);
    }
  },
  findByUuid: async (uuid: string) => {
    const offer = await Offer.findByPk(uuid);
    if (!offer) throw new OfferNotFound(uuid);

    return offer;
  }
};
