import { withObligatoryData } from "./withObligatoryData";
import { withOneSection } from "./withOneSection";
import { offerGenericGenerator } from "./offerGenericGenerator";
import { IOffer, Offer, OfferRepository } from "../../../src/models/Offer";
import { IOfferCareer } from "../../../src/models/Offer/OfferCareer";
import { IOfferSection } from "../../../src/models/Offer/OfferSection";

export interface IOfferInput {
  companyUuid: string;
  careers?: IOfferCareer[];
  sections?: IOfferSection[];
}
export type TCustomOfferGenerator<TData, TVariables> = Generator<TData, TData, TVariables>;
export type TOfferGenerator = TCustomOfferGenerator<Promise<Offer>, IOfferInput>;
export type TOfferDataGenerator = TCustomOfferGenerator<IOffer, IOfferInput>;

export const OfferGenerator = {
  instance: {
    withObligatoryData: async (): Promise<TOfferGenerator> => {
      const generator = offerGenericGenerator<Promise<Offer>, IOfferInput>(
        (index, variables) =>
          OfferRepository.create(withObligatoryData({ index, ...variables }))
      );
      await generator.next();
      return generator;
    },
    withOneSection: async (): Promise<TOfferGenerator> => {
      const generator = offerGenericGenerator<Promise<Offer>, IOfferInput>(
        (index, variables) =>
          OfferRepository.create(withOneSection({ index, ...variables }))
      );
      await generator.next();
      return generator;
    }
  },
  data: {
    withObligatoryData: (): TOfferDataGenerator => {
      const generator = offerGenericGenerator<IOffer, IOfferInput>(
        (index, variables) =>
          withObligatoryData({ index, ...variables })
      );
      generator.next();
      return generator;
    }
  }
};
