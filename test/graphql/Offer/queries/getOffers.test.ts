import { gql, ApolloError } from "apollo-server";
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
            companyId
            title
            description
            hoursPerDay
            minimumSalary
            maximumSalary
            sections {
                uuid
                title
                text
                displayOrder
            }
            careers {
                code
                description
                credits
            }
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
    it("should return two offers when two offers exists", async () => {
      const { id } = await CompanyRepository.create(companyMockData);
      const { code: careerCode1 } = await CareerRepository.create(careerMocks.careerData());
      const { code: careerCode2 } = await CareerRepository.create(careerMocks.careerData());
      await OfferRepository.create(OfferMocks.withOneCareer(id, careerCode1));
      await OfferRepository.create(OfferMocks.withOneCareer(id, careerCode2));
      const { data: { getOffers }, errors } = await executeQuery(GET_OFFERS);
      expect(errors).toBeUndefined();
      expect(getOffers).toHaveLength(2);
    });

    it("should return no offers when no offers were created", async () => {
      const { data: { getOffers }, errors } = await executeQuery(GET_OFFERS);
      expect(errors).toBeUndefined();
      expect(getOffers).toHaveLength(0);
    });
  });
});
