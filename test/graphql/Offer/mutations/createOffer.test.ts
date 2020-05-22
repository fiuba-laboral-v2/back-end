import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";

import { careerMocks } from "../../../models/Career/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";
import { loginFactory } from "../../../mocks/login";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";

const SAVE_OFFER_WITH_COMPLETE_DATA = gql`
    mutation createOffer(
        $companyUuid: String!, $title: String!, $description: String!, $hoursPerDay: Int!,
        $minimumSalary: Int!, $maximumSalary: Int!, $sections: [OfferSectionInput],
        $careers: [OfferCareerInput]
    ) {
        createOffer(
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
    mutation createOffer(
        $companyUuid: String!, $title: String!, $description: String!, $hoursPerDay: Int!,
        $minimumSalary: Int!, $maximumSalary: Int!
    ) {
        createOffer(
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
    Database.close();
  });

  describe("when the input values are valid", () => {
    it("should create a new offer with only obligatory data", async () => {
      const { company, apolloClient } = await loginFactory.company();

      const offerAttributes = OfferMocks.completeData(company.uuid);
      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: offerAttributes
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer).toHaveProperty("uuid");
      expect(data!.createOffer).toMatchObject(
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
      const { company, apolloClient } = await loginFactory.company();
      const { code } = await CareerRepository.create(careerMocks.careerData());

      const offerAttributes = OfferMocks.withOneCareerAndOneSection(company.uuid, code);
      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: offerAttributes
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer.sections).toHaveLength(1);
      expect(data!.createOffer.careers).toHaveLength(1);
    });
  });

  describe("when the input values are invalid", () => {
    it("should throw an error if no company uuid is provided", async () => {
      const { apolloClient } = await loginFactory.company();
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: OfferMocks.withNoCompanyId()
      });
      expect(errors).not.toBeUndefined();
    });

    it("should throw an error if company uuid doesn't exist", async () => {
      const { apolloClient } = await loginFactory.company();
      const notExistingCompanyUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      const offerAttributes = OfferMocks.completeData(notExistingCompanyUuid);
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_ONLY_OBLIGATORY_DATA,
        variables: offerAttributes
      });

      expect(errors![0].extensions!.data).toEqual(
        { errorType: "CompanyDoesNotExistError" }
      );
    });
  });
});
