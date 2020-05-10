import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { careerMocks } from "../../../models/Career/mocks";
import { companyMocks } from "../../../models/Company/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";

const SAVE_OFFER_WITH_COMPLETE_DATA = gql`
    mutation saveOffer(
        $companyUuid: String!, $title: String!, $description: String!, $hoursPerDay: Int!,
        $minimumSalary: Int!, $maximumSalary: Int!, $sections: [OfferSectionInput],
        $careers: [OfferCareerInput]
    ) {
        saveOffer(
            companyUuid: $companyUuid, title: $title, description: $description,
            hoursPerDay: $hoursPerDay, minimumSalary: $minimumSalary, maximumSalary: $maximumSalary,
            sections: $sections, careers: $careers
        ) {
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
              uuid
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

const SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA = gql`
    mutation saveOffer(
        $companyUuid: String!, $title: String!, $description: String!, $hoursPerDay: Int!,
        $minimumSalary: Int!, $maximumSalary: Int!
    ) {
        saveOffer(
            companyUuid: $companyUuid, title: $title, description: $description,
            hoursPerDay: $hoursPerDay, minimumSalary: $minimumSalary, maximumSalary: $maximumSalary
        ) {
            uuid
            title
            description
            hoursPerDay
            minimumSalary
            maximumSalary
        }
    }
`;

describe("saveOffer", () => {

  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  afterAll(() => Database.close());

  describe("when the input values are valid", () => {
    it("should create a new offer with only obligatory data", async () => {
      const { uuid } = await CompanyRepository.create(companyMocks.companyData());
      const offerAttributes = OfferMocks.completeData(uuid);
      const { data: { saveOffer }, errors } = await executeMutation(
        SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        offerAttributes
      );
      expect(errors).toBeUndefined();
      expect(saveOffer).toHaveProperty("uuid");
      expect(saveOffer).toMatchObject(
        {
          title: offerAttributes.title,
          description: offerAttributes.description,
          hoursPerDay: offerAttributes.hoursPerDay,
          minimumSalary: offerAttributes.minimumSalary,
          maximumSalary: offerAttributes.maximumSalary
        }
      );
    });

    it("should create a new offer with one section and one career", async () => {
      const { code } = await CareerRepository.create(careerMocks.careerData());
      const { uuid } = await CompanyRepository.create(companyMocks.companyData());
      const offerAttributes = OfferMocks.withOneCareerAndOneSection(uuid, code);
      const { data: { saveOffer }, errors } = await executeMutation(
        SAVE_OFFER_WITH_COMPLETE_DATA,
        offerAttributes
      );
      expect(errors).toBeUndefined();
      expect(saveOffer.sections).toHaveLength(1);
      expect(saveOffer.careers).toHaveLength(1);
    });
  });

  describe("when the input values are invalid", () => {
    it("should throw an error if no company uuid is provided", async () => {
      const { errors } = await executeMutation(
        SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        OfferMocks.withNoCompanyId()
      );
      expect(errors).not.toBeUndefined();
    });

    it("should throw an error if company uuid that not exist", async () => {
      const notExistingCompanyUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      const offerAttributes = OfferMocks.completeData(notExistingCompanyUuid);
      const { errors } = await executeMutation(
        SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        offerAttributes
      );
      expect(errors[0].extensions.data).toEqual(
        { errorType: "CompanyDoesNotExistError" }
      );
    });
  });
});
