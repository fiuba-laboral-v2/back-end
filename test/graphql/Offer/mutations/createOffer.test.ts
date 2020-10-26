import { gql } from "apollo-server";
import { client } from "../../ApolloTestClient";

import { CareerGenerator } from "$generators/Career";
import { OfferGenerator } from "$generators/Offer";
import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";

import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin } from "$models";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { UUID_REGEX } from "$test/models";

const SAVE_OFFER_WITH_COMPLETE_DATA = gql`
  mutation createOffer(
    $title: String!
    $description: String!
    $targetApplicantType: ApplicantType!
    $hoursPerDay: Int!
    $isInternship: Boolean!
    $minimumSalary: Int!
    $maximumSalary: Int!
    $sections: [OfferSectionInput]!
    $careers: [OfferCareerInput]!
  ) {
    createOffer(
      title: $title
      description: $description
      targetApplicantType: $targetApplicantType
      hoursPerDay: $hoursPerDay
      isInternship: $isInternship
      minimumSalary: $minimumSalary
      maximumSalary: $maximumSalary
      sections: $sections
      careers: $careers
    ) {
      uuid
      title
      description
      targetApplicantType
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

describe("createOffer", () => {
  let admin: Admin;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    admin = await AdminGenerator.extension();
  });

  describe("when the input values are valid", () => {
    it("creates a new offer with only obligatory data", async () => {
      const { apolloClient, company } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid
      });
      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: createOfferAttributes
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer).toMatchObject({
        uuid: expect.stringMatching(UUID_REGEX),
        title: createOfferAttributes.title,
        description: createOfferAttributes.description,
        hoursPerDay: createOfferAttributes.hoursPerDay,
        minimumSalary: createOfferAttributes.minimumSalary,
        maximumSalary: createOfferAttributes.maximumSalary,
        targetApplicantType: createOfferAttributes.targetApplicantType
      });
    });

    it("creates a new offer with one section and one career", async () => {
      const { apolloClient, company } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const { code, description } = await CareerGenerator.instance();
      const sectionData = { title: "title", text: "text", displayOrder: 1 };

      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid,
        careers: [{ careerCode: code }],
        sections: [sectionData]
      });
      const { data, errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: createOfferAttributes
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer.careers).toEqual([{ code, description }]);
      expect(data!.createOffer.sections).toEqual([
        {
          uuid: expect.stringMatching(UUID_REGEX),
          ...sectionData
        }
      ]);
    });
  });

  describe("when the input values are invalid", () => {
    const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
      const { apolloClient, company } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const {
        companyUuid,
        ...createOfferAttributesWithNoTitle
      } = OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid });
      delete createOfferAttributesWithNoTitle[attribute];

      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: createOfferAttributesWithNoTitle
      });
      expect(errors).toEqual([expect.objectContaining({ message: "Internal server error" })]);
    };

    it("throws an error if no title is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("title");
    });

    it("throws an error if no description is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("description");
    });

    it("throws an error if no targetApplicantType is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("targetApplicantType");
    });

    it("throws an error if no hoursPerDay is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("hoursPerDay");
    });

    it("throws an error if no minimumSalary is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("minimumSalary");
    });

    it("throws an error if no maximumSalary is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("maximumSalary");
    });

    it("throws an error if no user is logged in", async () => {
      const { company } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.approved
        }
      });
      const apolloClient = client.loggedOut();
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: createOfferAttributes
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
    });

    it("throws an error if the current user is not a company", async () => {
      const { company } = await TestClientGenerator.company();
      const { apolloClient } = await TestClientGenerator.applicant();
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: createOfferAttributes
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the company has pending approval status", async () => {
      const { apolloClient, company } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.pending
        }
      });
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: createOfferAttributes
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });

    it("returns an error if the company has rejected approval status", async () => {
      const { apolloClient, company } = await TestClientGenerator.company({
        status: {
          admin,
          approvalStatus: ApprovalStatus.rejected
        }
      });
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid
      });
      const { errors } = await apolloClient.mutate({
        mutation: SAVE_OFFER_WITH_COMPLETE_DATA,
        variables: createOfferAttributes
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
    });
  });
});
