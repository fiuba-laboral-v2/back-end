import { OfferCareer } from "$models";
import { IBulkCreate, IUpdate } from "./Interface";

export const OfferCareerRepository = {
  bulkCreate: ({ careers, offer: { uuid: offerUuid }, transaction }: IBulkCreate) =>
    OfferCareer.bulkCreate(
      careers.map(({ careerCode }) => ({ careerCode, offerUuid })),
      { transaction, validate: true }
    ),
  update: async ({ careers, offer, transaction }: IUpdate) => {
    await OfferCareer.destroy({ where: { offerUuid: offer.uuid }, transaction });
    return OfferCareerRepository.bulkCreate({ careers, offer, transaction });
  }
};
