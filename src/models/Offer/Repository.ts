import { Database } from "../../config/Database";
import { IOffer } from "./";
import { IOfferSection } from "./OfferSection";
import { IOfferCareer } from "./OfferCareer";
import { OfferNotFound } from "./Errors";
import { Offer, OfferCareer, OfferSection } from "..";
import { Op } from "sequelize";

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
  update: async (offer: IOffer & { uuid: string }) => {
    const [, [updatedOffer]] = await Offer.update(offer, {
      where: { uuid: offer.uuid },
      returning: true
    });
    if (!updatedOffer) throw new OfferNotFound(offer.uuid);
    return updatedOffer;
  },
  save: async (
    offer: Offer,
    sections: IOfferSection[],
    offersCareers: IOfferCareer[]
  ) => Database.transaction(async transaction => {
    await offer.save({ transaction });
    await Promise.all(sections.map(section =>
      OfferSection.create({ ...section, offerUuid: offer.uuid }, { transaction })
    ));
    await Promise.all(offersCareers.map(({ careerCode }) =>
      OfferCareer.create({ careerCode, offerUuid: offer.uuid }, { transaction })
    ));
    return offer;
  }),
  findByUuid: async (uuid: string) => {
    const offer = await Offer.findByPk(uuid);
    if (!offer) throw new OfferNotFound(uuid);

    return offer;
  },
  findAll: ({ updatedBeforeThan }: { updatedBeforeThan?: string }) =>
    Offer.findAll({
      ...(updatedBeforeThan && {
        where: {
          updatedAt: {
            [Op.lt]: updatedBeforeThan
          }
        }
      }),
      order: [["createdAt", "DESC"]],
      limit: 10
    }),
  findByCompanyUuid: (companyUuid: string) =>
    Offer.findAll({ where: { companyUuid } }),
  truncate: () => Offer.truncate({ cascade: true })
};
