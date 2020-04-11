import { gql, ApolloError } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";
import { OfferNotFound } from "../../../../src/models/Offer/Errors";
import { GraphQLResponse } from "../../ResponseSerializers";

import { careerMocks } from "../../../models/Career/mocks";
import { companyMockData } from "../../../models/Company/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";

const GET_OFFER_BY_UUID = gql`
  query ($uuid: ID!) {
    getOfferByUuid(uuid: $uuid) {
      uuid
      title
      description
      hoursPerDay
      minimumSalary
      maximumSalary
      createdAt
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
      company {
        cuit
        companyName
        slogan
        description
        logo
        website
        email
        phoneNumbers
        photos
      }
    }
  }
`;

describe("getOfferByUuid", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  afterAll(() => Database.close());

  const createOffer = async () => {
    const { id } = await CompanyRepository.create(companyMockData);
    const { code } = await CareerRepository.create(careerMocks.careerData());
    return OfferRepository.create(OfferMocks.withOneCareerAndOneSection(id, code));
  };

  describe("when and offer exists", () => {
    it("should find an offer by uuid", async () => {
      const offer = await createOffer();
      const { data: { getOfferByUuid }, errors } = await executeQuery(
        GET_OFFER_BY_UUID,
        { uuid: offer.uuid }
      );
      expect(errors).toBeUndefined();
      expect(getOfferByUuid).toMatchObject(
        await GraphQLResponse.offer.getOfferByUuid(offer)
      );
    });

    it("should find an offer with one career", async () => {
      const offer = await createOffer();
      const { data: { getOfferByUuid }, errors } = await executeQuery(
        GET_OFFER_BY_UUID,
        { uuid: offer.uuid }
      );
      expect(errors).toBeUndefined();
      expect(getOfferByUuid.careers).toHaveLength(1);
      expect(getOfferByUuid.careers).toMatchObject(
        (await GraphQLResponse.offer.getOfferByUuid(offer)).careers
      );
    });

    it("should find an offer with its company", async () => {
      const offer = await createOffer();
      const { data: { getOfferByUuid }, errors } = await executeQuery(
        GET_OFFER_BY_UUID,
        { uuid: offer.uuid }
      );
      expect(errors).toBeUndefined();
      expect(getOfferByUuid.company).toMatchObject(
        (await GraphQLResponse.offer.getOfferByUuid(offer)).company
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
