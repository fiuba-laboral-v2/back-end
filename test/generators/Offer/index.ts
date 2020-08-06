import { withObligatoryData } from "./withObligatoryData";
import { withOneSection } from "./withOneSection";
import { IOffer, OfferRepository } from "$models/Offer";
import { Offer } from "$models";
import { IOfferCareer } from "$models/Offer/OfferCareer";
import { IOfferSection } from "$models/Offer/OfferSection";
import { GenericGenerator, TGenericGenerator } from "../GenericGenerator";

export interface IOfferInput {
  companyUuid: string;
  careers?: IOfferCareer[];
  sections?: IOfferSection[];
}

export type TOfferGenerator = TGenericGenerator<Promise<Offer>, IOfferInput>;
export type TOfferDataGenerator = TGenericGenerator<IOffer, IOfferInput>;

export const OfferGenerator = {
  instance: {
    withObligatoryData: async (): Promise<TOfferGenerator> => {
      const generator = GenericGenerator<Promise<Offer>, IOfferInput>(
        (index, variables) =>
          OfferRepository.create(withObligatoryData({ index, ...variables }))
      );
      await generator.next();
      return generator;
    },
    withOneSection: async (): Promise<TOfferGenerator> => {
      const generator = GenericGenerator<Promise<Offer>, IOfferInput>(
        (index, variables) =>
          OfferRepository.create(withOneSection({ index, ...variables }))
      );
      await generator.next();
      return generator;
    }
  },
  data: {
    withObligatoryData: (): TOfferDataGenerator => {
      const generator = GenericGenerator<IOffer, IOfferInput>(
        (index, variables) =>
          withObligatoryData({ index, ...variables })
      );
      generator.next();
      return generator;
    }
  }
};
