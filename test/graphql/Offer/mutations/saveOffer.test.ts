import { gql } from "apollo-server";
import { executeMutation } from "../../ApolloTestClient";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { careerMocks } from "../../../models/Career/mocks";
import { companyMockData } from "../../../models/Company/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";
import { GraphQLResponse } from "../../ResponseSerializers";

const SAVE_OFFER_WITH_COMPLETE_DATA = gql`
    mutation saveOffer(
        $companyId: Int!, $title: String!, $description: String!, $hoursPerDay: Int!,
        $minimumSalary: Int!, $maximumSalary: Int!, $sections: [OfferSectionInput],
        $careers: [OfferCareerInput]
    ) {
        saveOffer(
            companyId: $companyId, title: $title, description: $description,
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
              id
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
        $companyId: Int!, $title: String!, $description: String!, $hoursPerDay: Int!,
        $minimumSalary: Int!, $maximumSalary: Int!
    ) {
        saveOffer(
            companyId: $companyId, title: $title, description: $description,
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
      const { id } = await CompanyRepository.create(companyMockData);
      const offerAttributes = OfferMocks.completeData(id);
      const { data: { saveOffer }, errors } = await executeMutation(
        SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        offerAttributes
      );
      expect(errors).toBeUndefined();
      expect(saveOffer).toMatchObject(
        GraphQLResponse.offer.saveOfferWithOnlyObligatoryData(offerAttributes)
      );
    });

    it("should create a new offer with one section and one career", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const company = await CompanyRepository.create(companyMockData);
      const offerAttributes = OfferMocks.withOneCareerAndOneSection(company.id, career.code);
      const { data: { saveOffer }, errors } = await executeMutation(
        SAVE_OFFER_WITH_COMPLETE_DATA,
        offerAttributes
      );
      expect(errors).toBeUndefined();
      expect(saveOffer).toMatchObject(
        await GraphQLResponse.offer.saveOfferWithCompleteData(offerAttributes, [ career ], company)
      );
    });
  });

  describe("when the input values are invalid", () => {
    it("should raise an error if no company id is provided", async () => {
      const { errors } = await executeMutation(
        SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        OfferMocks.withNoCompanyId()
      );
      expect(errors).not.toBeUndefined();
    });
  });
});
