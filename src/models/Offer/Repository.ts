import Database from "../../config/Database";
import { Offer, IOffer } from "./";
import { OfferSection, IOfferSection } from "./OfferSection";
import { OfferCareer, IOfferCareer } from "./OfferCareer";
import { OfferNotFound } from "./Errors";

export const OfferRepository = {
  create: (
    {
      careers = [],
      sections = [],
      ...attributes
    }: IOffer) => {
    const offer = new Offer(attributes);
    return OfferRepository.save(offer, sections, careers);
  },
  save: async (offer: Offer, sections: IOfferSection[], offersCareers: IOfferCareer[]) => {
    const transaction = await Database.transaction();
    try {
      await offer.save({ transaction });
      await Promise.all(sections.map(section => (
        OfferSection.create({ ...section, offerUuid: offer.uuid }, { transaction })
      )));
      await Promise.all(offersCareers.map(({ careerCode }) => (
        OfferCareer.create({ careerCode, offerUuid: offer.uuid }, { transaction })
      )));
      await transaction.commit();
      return offer;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  findByUuid: async (uuid: string) => {
    const offer = await Offer.findByPk(uuid);
    if (!offer) throw new OfferNotFound(uuid);

    return offer;
  },
  findAll: () => Offer.findAll(),
  findByCompanyUuid: (companyUuid: string) =>
    Offer.findAll({ where: { companyUuid } }),
  truncate: () => Offer.truncate({ cascade: true })
};
