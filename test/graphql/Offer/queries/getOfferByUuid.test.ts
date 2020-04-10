import { gql, ApolloError } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";
import { OfferNotFound } from "../../../../src/models/Offer/Errors";

import { careerMocks } from "../../../models/Career/mocks";
import { companyMockData } from "../../../models/Company/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";

import { omit } from "lodash";

const GET_OFFER_BY_UUID = gql`
  query ($uuid: ID!) {
    getOfferByUuid(uuid: $uuid) {
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

describe("getOfferByUuid", () => {
  beforeAll(async () => Database.setConnection());

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  afterAll(async () => Database.close());

  const createOffer = async () => {
    const company = await CompanyRepository.create(companyMockData);
    const career = await CareerRepository.create(careerMocks.careerData());
    const offerAttributes = OfferMocks.withOneCareerAndOneSection(company.id, career.code);
    const offer = await OfferRepository.create(offerAttributes);
    return { company, career, offer, offerAttributes };
  };

  describe("when and offer exists", () => {
    it("should find an offer by uuid", async () => {
      const { offer, offerAttributes, career } = await createOffer();
      const { data: { getOfferByUuid }, errors } = await executeQuery(
        GET_OFFER_BY_UUID,
        { uuid: offer.uuid }
      );
      expect(errors).toBeUndefined();
      expect(getOfferByUuid).toMatchObject(omit(offerAttributes, ["careers"]));
      expect(getOfferByUuid.careers).toHaveLength(1);
      expect(getOfferByUuid.careers[0]).toMatchObject(
        {
          code: career.code,
          description: career.description,
          credits: career.credits
        }
      );
    });
  });

  describe("when no offer exists", () => {
    it("should raise and error if no offer exist", async () => {
      const randomUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      const { errors } = await executeQuery(
        GET_OFFER_BY_UUID,
        { uuid: randomUuid }
      );
      expect(errors[0]).toEqual(new ApolloError(OfferNotFound.buildMessage(randomUuid)));
    });
  });
});
