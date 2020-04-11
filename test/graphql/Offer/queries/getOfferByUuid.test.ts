import { gql, ApolloError } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository, Career } from "../../../../src/models/Career";
import { CompanyRepository, Company } from "../../../../src/models/Company";
import { OfferRepository, Offer } from "../../../../src/models/Offer";
import { OfferSection } from "../../../../src/models/Offer/OfferSection";
import { OfferNotFound } from "../../../../src/models/Offer/Errors";

import { careerMocks } from "../../../models/Career/mocks";
import { companyMockData } from "../../../models/Company/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";

import { omit } from "lodash";

const GET_OFFER_BY_UUID = gql`
  query ($uuid: ID!) {
    getOfferByUuid(uuid: $uuid) {
      uuid
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

  const expectedSection = (section: OfferSection) => (
    {
      uuid: section.uuid,
      title: section.title,
      text: section.text,
      displayOrder: section.displayOrder
    }
  );

  const expectedCareer = (career: Career) => (
    {
      code: career.code,
      description: career.description,
      credits: career.credits
    }
  );

  const expectedCompany = async (company: Company) => (
    {
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
  );

  const expectedCompleteOffer = async (offer: Offer) => (
    {
      uuid: offer.uuid,
      title: offer.title,
      description: offer.description,
      hoursPerDay: offer.hoursPerDay,
      minimumSalary: offer.minimumSalary,
      maximumSalary: offer.maximumSalary,
      sections: (await offer.getSections()).map(section => expectedSection(section)),
      careers: (await offer.getCareers()).map(career => expectedCareer(career)),
      company: await expectedCompany(await offer.getCompany())
    }
  );

  describe("when and offer exists", () => {
    it("should find an offer by uuid", async () => {
      const offer = await createOffer();
      const { data: { getOfferByUuid }, errors } = await executeQuery(
        GET_OFFER_BY_UUID,
        { uuid: offer.uuid }
      );
      expect(errors).toBeUndefined();
      expect(getOfferByUuid).toMatchObject(await expectedCompleteOffer(offer));
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
        (await expectedCompleteOffer(offer)).careers
      );
    });

    it("should find an offer with its company", async () => {
      const offer = await createOffer();
      const { data: { getOfferByUuid }, errors } = await executeQuery(
        GET_OFFER_BY_UUID,
        { uuid: offer.uuid }
      );

      const company = await offer.getCompany();
      expect(errors).toBeUndefined();
      expect(getOfferByUuid.company).toMatchObject((await expectedCompleteOffer(offer)).company);
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
