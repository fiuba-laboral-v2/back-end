import { withObligatoryData } from "./withObligatoryData";
import { withOneSection } from "./withOneSection";
import { OfferRepository } from "$models/Offer";
import { Offer } from "$models";
import { IOfferCareer } from "$models/Offer/OfferCareer";
import { IOfferSection } from "$models/Offer/OfferSection";
import { GenericGenerator, TGenericGenerator } from "../GenericGenerator";
import { IOfferAttributes } from "$models/Offer/Interface";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";

export interface IOfferInput {
  companyUuid: string;
  careers?: IOfferCareer[];
  sections?: IOfferSection[];
}

export type TOfferGenerator = TGenericGenerator<Promise<Offer>, IOfferInput>;
export type TOfferDataGenerator = TGenericGenerator<IOfferAttributes, IOfferInput>;

interface IUpdatedWithStatus {
  secretary: Secretary;
  status: ApprovalStatus;
}

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
    },
    updatedWithStatus: async () => {
      const generator = GenericGenerator<Promise<Offer>, IOfferInput & IUpdatedWithStatus>(
        async (index, { status, secretary, ...variables }) => {
          const offer = await OfferRepository.create(withOneSection({ index, ...variables }));
          return OfferRepository.updateStatus({ uuid: offer.uuid, status, secretary });
        }
      );
      await generator.next();
      return generator;
    }
  },
  data: {
    withObligatoryData: (): TOfferDataGenerator => {
      const generator = GenericGenerator<IOfferAttributes, IOfferInput>(
        (index, variables) =>
          withObligatoryData({ index, ...variables })
      );
      generator.next();
      return generator;
    }
  }
};
