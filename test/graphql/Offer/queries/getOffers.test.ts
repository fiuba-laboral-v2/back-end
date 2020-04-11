import { gql } from "apollo-server";
import { executeQuery } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { Career, CareerRepository } from "../../../../src/models/Career";
import { Company, CompanyRepository } from "../../../../src/models/Company";
import { Offer, OfferRepository } from "../../../../src/models/Offer";
import { OfferSection } from "../../../../src/models/Offer/OfferSection";

import { careerMocks } from "../../../models/Career/mocks";
import { companyMockData } from "../../../models/Company/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";
import { omit } from "lodash";

const GET_OFFERS = gql`
  query {
    getOffers {
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

describe("getOffers", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  afterAll(() => Database.close());

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
      createdAt: offer.createdAt.getTime().toString(),
      sections: (await offer.getSections()).map(section => expectedSection(section)),
      careers: (await offer.getCareers()).map(career => expectedCareer(career)),
      company: await expectedCompany(await offer.getCompany())
    }
  );

  describe("when offers exists", () => {
    const createOffers = async ()  => {
      const { id } = await CompanyRepository.create(companyMockData);
      const career1 = await CareerRepository.create(careerMocks.careerData());
      const career2 = await CareerRepository.create(careerMocks.careerData());
      const offerAttributes1 = OfferMocks.withOneCareer(id, career1.code);
      const offerAttributes2 = OfferMocks.withOneCareer(id, career2.code);
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

    it("should return two offers when two offers exists", async () => {
      const { offer1, offer2 } = await createOffers();
      const { data: { getOffers }, errors } = await executeQuery(GET_OFFERS);
      expect(errors).toBeUndefined();
      expect(getOffers).toMatchObject(
        [
          await expectedCompleteOffer(offer1),
          await expectedCompleteOffer(offer2)
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
