import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";

import { careerMocks } from "../../../models/Career/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";
import { testClientFactory } from "../../../mocks/testClientFactory";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";

const SAVE_OFFER_WITH_COMPLETE_DATA = gql`
    mutation createOffer(
        $title: String!, $description: String!, $hoursPerDay: Int!,
        $minimumSalary: Int!, $maximumSalary: Int!, $sections: [OfferSectionInput],
        $careers: [OfferCareerInput]
    ) {
        createOffer(
            title: $title, description: $description,
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
    mutation createOffer(
        $title: String!,
        $description: String!,
        $hoursPerDay: Int!,
        $minimumSalary: Int!,
        $maximumSalary: Int!
    ) {
        createOffer(
            title: $title,
            description: $description,
            hoursPerDay: $hoursPerDay,
            minimumSalary: $minimumSalary,
            maximumSalary: $maximumSalary
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

describe("createOffer", () => {
  beforeAll(() => {
    Database.setConnection();
    return Promise.all([
      CompanyRepository.truncate(),
      CareerRepository.truncate(),
      UserRepository.truncate()
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      CompanyRepository.truncate(),
      CareerRepository.truncate(),
      UserRepository.truncate()
    ]);
    return Database.close();
  });

  describe("when the input values are valid", () => {
    it("should create a new offer with only obligatory data", async () => {
      const { company, apolloClient } = await testClientFactory.company();

      const { companyUuid, ...createOfferAttributes } = OfferMocks.completeData(company.uuid);
      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: createOfferAttributes
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer).toHaveProperty("uuid");
      expect(data!.createOffer).toMatchObject(
        {
          title: createOfferAttributes.title,
          description: createOfferAttributes.description,
          hoursPerDay: createOfferAttributes.hoursPerDay,
          minimumSalary: createOfferAttributes.minimumSalary,
          maximumSalary: createOfferAttributes.maximumSalary
        }
      );
    });

    it("should create a new offer with one section and one career", async () => {
      const { company, apolloClient } = await testClientFactory.company();
      const { code } = await CareerRepository.create(careerMocks.careerData());

      const { companyUuid, ...createOfferAttributes } = OfferMocks.withOneCareerAndOneSection(
        company.uuid,
        code
      );
      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: createOfferAttributes
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer.sections).toHaveLength(1);
      expect(data!.createOffer.careers).toHaveLength(1);
    });
  });

  describe("when the input values are invalid", () => {
    it("should throw an error if no title is provided", async () => {
      const { apolloClient } = await testClientFactory.company();
      const {
        companyUuid,
        title,
        ...createOfferAttributesWithNoTitle
      } = OfferMocks.completeData("");
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: createOfferAttributesWithNoTitle
      });
      expect(errors).not.toBeUndefined();
    });
  });
});
