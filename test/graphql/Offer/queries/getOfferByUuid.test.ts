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
    const company = await CompanyRepository.create(companyMockData);
    const career = await CareerRepository.create(careerMocks.careerData());
    const offer = await OfferRepository.create(
      OfferMocks.withOneCareerAndOneSection(company.id, career.code)
    );
    return { offer, career, company };
  };

  describe("when and offer exists", () => {
    it("should find an offer by uuid", async () => {
      const { offer, career, company } = await createOffer();
      const { data: { getOfferByUuid }, errors } = await executeQuery(
        GET_OFFER_BY_UUID,
        { uuid: offer.uuid }
      );
      expect(errors).toBeUndefined();
      expect(getOfferByUuid).toMatchObject(
        {
          uuid: offer.uuid,
          title: offer.title,
          description: offer.description,
          hoursPerDay: offer.hoursPerDay,
          minimumSalary: offer.minimumSalary,
          maximumSalary: offer.maximumSalary,
          createdAt: offer.createdAt.getTime().toString(),
          careers: [
            {
              code: career.code,
              description: career.description,
              credits: career.credits
            }
          ],
          sections: await offer.getSections().map(section =>(
            {
              uuid: section.uuid,
              title: section.title,
              text: section.text,
              displayOrder: section.displayOrder
            }
          )),
          company: {
            cuit: company.cuit,
            companyName: company.companyName,
            slogan: company.slogan,
            description: company.description,
            logo: company.logo,
            website: company.website,
            email: company.email,
            phoneNumbers: await company.getPhoneNumbers(),
            photos: await company.getPhotos()
          }
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
