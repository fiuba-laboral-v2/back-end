import { omit } from "lodash";
import Database from "../../config/Database";
import { Offer, IOffer } from "./";
import { OfferSection } from "./OfferSection";
import { OfferNotFound } from "./Errors";

export const OfferRepository = {
  create: async (
    {
      sections = [],
      ...attributes
    }: IOffer) => {
    const offer = new Offer(omit(attributes, ["sections"]));
    const offerSections = sections.map(section => new OfferSection(omit(section, ["uuid"])));
    return OfferRepository.save(offer, offerSections);
  },
  save: async (offer: Offer, sections: OfferSection[] = []) => {
    const transaction = await Database.transaction();
    try {
      await offer.save({ transaction });
      await Promise.all(sections.map(section => {
        section.offerUuid = offer.uuid;
        return section.save({ transaction });
      }));
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
  },
  truncate: () => Offer.truncate({ cascade: true })
};
