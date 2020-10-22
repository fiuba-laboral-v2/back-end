import { Offer, OfferSection } from "$models";
import { SectionRepository, IUpdateProps } from "$models/Section";

const entityUuidKey = "offerUuid";
const modelClass = OfferSection;

export const OfferSectionRepository = {
  update: async ({
    offer,
    ...updateArguments
  }: IUpdateProps & { offer: Offer }): Promise<OfferSection[]> =>
    SectionRepository.update({
      modelClass,
      entity: offer,
      entityUuidKey,
      ...updateArguments
    }),
  findByOffer: (offer: Offer): Promise<OfferSection[]> =>
    SectionRepository.findByEntity({ modelClass, entityUuidKey, entity: offer }),
  truncate: () => SectionRepository.truncate(OfferSection)
};
