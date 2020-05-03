import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";

import { careerMocks } from "../../../models/Career/mocks";
import { companyMockData } from "../../../models/Company/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";

const GET_OFFERS = gql`
  query {
    getOffers {
      uuid
    }
  }
`;

describe("getOffers", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  afterAll(() => Database.close());

  describe("when offers exists", () => {
    const createOffers = async () => {
      const { uuid } = await CompanyRepository.create(companyMockData);
      const career1 = await CareerRepository.create(careerMocks.careerData());
      const career2 = await CareerRepository.create(careerMocks.careerData());
      const offerAttributes1 = OfferMocks.withOneCareer(uuid, career1.code);
      const offerAttributes2 = OfferMocks.withOneCareer(uuid, career2.code);
      const offer1 = await OfferRepository.create(offerAttributes1);
      const offer2 = await OfferRepository.create(offerAttributes2);
      return { offer1, offer2 };
    };

    it("should return two offers if two offers were created", async () => {
      await createOffers();
      const { data: { getOffers }, errors } = await executeQuery(GET_OFFERS);
      expect(errors).toBeUndefined();
      expect(getOffers).toHaveLength(2);
    });

    it("should return two offers with there own uuid", async () => {
      const { offer1, offer2 } = await createOffers();
      const { data: { getOffers }, errors } = await executeQuery(GET_OFFERS);
      expect(errors).toBeUndefined();
      expect(getOffers).toMatchObject(
        [
          { uuid: offer1.uuid },
          { uuid: offer2.uuid }
        ]
      );
    });
  });

  describe("when no offers exists", () => {
    it("should return no offers when no offers were created", async () => {
      const { data: { getOffers }, errors } = await executeQuery(GET_OFFERS);
      expect(errors).toBeUndefined();
      expect(getOffers).toHaveLength(0);
    });
  });
});
