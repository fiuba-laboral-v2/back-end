import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";

import { CareerGenerator, TCareerGenerator } from "../../../generators/Career";
import { OfferGenerator, TOfferDataGenerator } from "../../../generators/Offer";
import { testClientFactory } from "../../../mocks/testClientFactory";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";

const SAVE_OFFER_WITH_COMPLETE_DATA = gql`
    mutation createOffer(
        $title: String!,
        $description: String!,
        $hoursPerDay: Int!,
        $minimumSalary: Int!,
        $maximumSalary: Int!,
        $sections: [OfferSectionInput],
        $careers: [OfferCareerInput]
    ) {
        createOffer(
            title: $title,
            description: $description,
            hoursPerDay: $hoursPerDay,
            minimumSalary: $minimumSalary,
            maximumSalary: $maximumSalary,
            sections: $sections,
            careers: $careers
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
  let careers: TCareerGenerator;
  let offers: TOfferDataGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.instance();
    offers = OfferGenerator.data.withObligatoryData();
  });

  afterAll(() => Database.close());

  describe("when the input values are valid", () => {
    it("should create a new offer with only obligatory data", async () => {
      const { company, apolloClient } = await testClientFactory.company();

      const { companyUuid, ...createOfferAttributes } = offers.next({
        companyUuid: company.uuid
      }).value;
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
      const { code } = await careers.next().value;

      const { companyUuid, ...createOfferAttributes } = offers.next({
        companyUuid: company.uuid
      }).value;
      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: {
          ...createOfferAttributes,
          careers: [{ careerCode: code }],
          sections: [{
            title: "title",
            text: "text",
            displayOrder: 1
          }]
        }
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer.sections).toHaveLength(1);
      expect(data!.createOffer.careers).toHaveLength(1);
    });
  });

  describe("when the input values are invalid", () => {
    it("should throw an error if no title is provided", async () => {
      const { company, apolloClient } = await testClientFactory.company();
      const {
        companyUuid,
        title,
        ...createOfferAttributesWithNoTitle
      } = offers.next({ companyUuid: company.uuid }).value;
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: createOfferAttributesWithNoTitle
      });
      expect(errors).not.toBeUndefined();
    });
  });
});
