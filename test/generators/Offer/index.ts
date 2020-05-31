import { withObligatoryData } from "./withObligatoryData";
import { IOffer, Offer, OfferRepository } from "../../../src/models/Offer";

interface ICompanyUuid { companyUuid: string; }
type CustomOfferGenerator<T> = Generator<T, T, ICompanyUuid>;
export type TOfferGenerator = CustomOfferGenerator<Promise<Offer>>;
export type TOfferDataGenerator = CustomOfferGenerator<IOffer>;

export const OfferGenerator = {
  instance: {
    withObligatoryData: async (): Promise<TOfferGenerator> => {
      const generator = function*(): TOfferGenerator {
        let index = 0;
        let companyUuid: string = "";
        while (true) {
          if (companyUuid === "") {
            companyUuid = (yield Promise.resolve(new Offer({}))).companyUuid;
            continue;
          }

          const response = yield OfferRepository.create(withObligatoryData({ index, companyUuid }));
          companyUuid = response.companyUuid;
          index++;
        }
      };
      const offers: TOfferGenerator = generator();
      await offers.next();
      return offers;
    }
  },
  data: {
    withObligatoryData: (): TOfferDataGenerator => {
      const generator = function*(): TOfferDataGenerator {
        let index = 0;
        let companyUuid: string = "";
        while (true) {
          if (companyUuid === "") {
            companyUuid = (yield withObligatoryData({ index, companyUuid })).companyUuid;
            continue;
          }

          const response = yield withObligatoryData({ index, companyUuid });
          companyUuid = response.companyUuid;
          index++;
        }
      };
      const offersData: TOfferDataGenerator = generator();
      offersData.next();
      return offersData;
    }
  }
};
