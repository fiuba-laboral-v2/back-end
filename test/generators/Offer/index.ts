import { withObligatoryData } from "./withObligatoryData";
import { offerGenericGenerator } from "./offerGenericGenerator";
import { IOffer, Offer, OfferRepository } from "../../../src/models/Offer";
import { IOfferCareer } from "../../../src/models/Offer/OfferCareer";

interface IOfferInput {
  companyUuid: string;
  careers?: IOfferCareer[];
}
export type TCustomOfferGenerator<TData, TVariables> = Generator<TData, TData, TVariables>;
export type TOfferGenerator = TCustomOfferGenerator<Promise<Offer>, IOfferInput>;
export type TOfferDataGenerator = TCustomOfferGenerator<IOffer, IOfferInput>;

export const OfferGenerator = {
  instance: {
    withObligatoryData: async (): Promise<TOfferGenerator> => {
      const generator = offerGenericGenerator<Promise<Offer>, IOfferInput>(
        (index, { companyUuid }) =>
          OfferRepository.create(withObligatoryData({ index, companyUuid }))
      );
      await generator.next();
      return generator;
    },
    withCareers: async (): Promise<TOfferGenerator> => {
      const generator = offerGenericGenerator<Promise<Offer>, IOfferInput>(
        (index, { companyUuid, careers }) =>
          OfferRepository.create({ ...withObligatoryData({ index, companyUuid }), careers })
      );
      await generator.next();
      return generator;
    }
  },
  data: {
    withObligatoryData: (): TOfferDataGenerator => {
      const generator = offerGenericGenerator<IOffer, IOfferInput>(
        (index, { companyUuid }) =>
          withObligatoryData({ index, companyUuid })
      );
      generator.next();
      return generator;
    }
  }
};
