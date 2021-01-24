import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { client } from "$test/graphql/ApolloTestClient";

import { omit } from "lodash";

import { UUID_REGEX } from "$test/models";
import { CareerGenerator } from "$generators/Career";
import { OfferGenerator } from "$generators/Offer";
import { TestClientGenerator } from "$generators/TestClient";

import { CareerRepository } from "$models/Career";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { CompanyWithNoInternshipAgreementError, IOfferAttributes } from "$models/Offer";
import { Career, Company } from "$models";

import { OfferWithNoCareersError } from "$graphql/Offer/Errors";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { GraphQLFormattedError } from "graphql";
import { ApplicantType } from "$models/Applicant";

const CREATE_OFFER = gql`
  mutation createOffer(
    $title: String!
    $description: String!
    $targetApplicantType: ApplicantType!
    $hoursPerDay: Int!
    $isInternship: Boolean!
    $minimumSalary: Int!
    $maximumSalary: Int
    $sections: [OfferSectionInput]
    $careers: [OfferCareerInput!]!
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
      isInternship
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
  let firstCareer: Career;
  let secondCareer: Career;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();

    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();
  });

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: approvalStatus });

  describe("when the input values are valid", () => {
    it("creates a new offer with only obligatory data", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid,
        careers: [{ careerCode: firstCareer.code }, { careerCode: secondCareer.code }]
      });
      const { data, errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: createOfferAttributes
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer).toBeObjectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        title: createOfferAttributes.title,
        description: createOfferAttributes.description,
        hoursPerDay: createOfferAttributes.hoursPerDay,
        isInternship: createOfferAttributes.isInternship,
        minimumSalary: createOfferAttributes.minimumSalary,
        maximumSalary: createOfferAttributes.maximumSalary,
        targetApplicantType: createOfferAttributes.targetApplicantType,
        careers: expect.arrayContaining([
          { code: firstCareer.code, description: firstCareer.description },
          { code: secondCareer.code, description: secondCareer.description }
        ])
      });
    });

    it("creates a new offer without maximum salary", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid,
        careers: [{ careerCode: firstCareer.code }]
      });
      const { data, errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: { ...createOfferAttributes, maximumSalary: null }
      });

      expect(errors).toBeUndefined();
      expect(data!.createOffer).toBeObjectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        title: createOfferAttributes.title,
        description: createOfferAttributes.description,
        hoursPerDay: createOfferAttributes.hoursPerDay,
        isInternship: createOfferAttributes.isInternship,
        minimumSalary: createOfferAttributes.minimumSalary,
        maximumSalary: null,
        targetApplicantType: createOfferAttributes.targetApplicantType,
        careers: [{ code: firstCareer.code, description: firstCareer.description }]
      });
    });

    it("creates a new internship", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.internship({
        companyUuid: company.uuid,
        careers: [{ careerCode: firstCareer.code }]
      });
      const { data, errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: createOfferAttributes
      });
      expect(errors).toBeUndefined();
      expect(data!.createOffer).toBeObjectContaining({
        isInternship: true,
        minimumSalary: createOfferAttributes.minimumSalary,
        maximumSalary: null,
        targetApplicantType: ApplicantType.student
      });
    });

    it("throws an error when an internship has maximum salary", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.internship({
        companyUuid: company.uuid,
        maximumSalary: 999,
        careers: [{ careerCode: firstCareer.code }]
      });
      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: createOfferAttributes
      });
      expect(errors).toEqualGraphQLErrorType("ValidationError");
    });

    it("throws an error when an internship targets graduates", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.internship({
        companyUuid: company.uuid,
        targetApplicantType: ApplicantType.graduate,
        careers: [{ careerCode: firstCareer.code }]
      });
      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: { ...createOfferAttributes, maximumSalary: null }
      });
      expect(errors).toEqualGraphQLErrorType("ValidationError");
    });

    it("throws an error when an internship targets both graduates and students", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.internship({
        companyUuid: company.uuid,
        targetApplicantType: ApplicantType.both,
        careers: [{ careerCode: firstCareer.code }]
      });
      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: { ...createOfferAttributes, maximumSalary: null }
      });
      expect(errors).toEqualGraphQLErrorType("ValidationError");
    });

    it("throws an error when an internship is created by a company with no internship agreement", async () => {
      const { apolloClient, company } = await TestClientGenerator.company({
        status: ApprovalStatus.approved,
        hasAnInternshipAgreement: false
      });

      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.internship({
        companyUuid: company.uuid,
        targetApplicantType: ApplicantType.student,
        careers: [{ careerCode: firstCareer.code }]
      });
      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: { ...createOfferAttributes, maximumSalary: null }
      });
      expect(errors).toEqualGraphQLErrorType(CompanyWithNoInternshipAgreementError.name);
    });

    it("creates a new offer with one section and one career", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
      const { code, description } = firstCareer;
      const sectionData = { title: "title", text: "text", displayOrder: 1 };

      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid,
        careers: [{ careerCode: code }],
        sections: [sectionData]
      });
      const { data, errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
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
    let apolloClient: TestClient;
    let company: Company;
    let offerAttributes: IOfferAttributes;

    beforeAll(async () => {
      const testClient = await createCompanyTestClient(ApprovalStatus.approved);
      apolloClient = testClient.apolloClient;
      company = testClient.company;
      offerAttributes = OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid });
    });

    const expectApolloErrorToHaveInternalServerErrorMessage = (
      errors?: ReadonlyArray<GraphQLFormattedError>
    ) => expect(errors).toEqual([expect.objectContaining({ message: "Internal server error" })]);

    const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
      const { companyUuid, ...attributes } = offerAttributes;
      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: omit(attributes, attribute)
      });
      expectApolloErrorToHaveInternalServerErrorMessage(errors);
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

    it("throws an error if no isInternship value is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("isInternship");
    });

    it("throws an error if no minimumSalary is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("minimumSalary");
    });

    it("throws an error if no careers is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("careers");
    });

    it("throws an error if given an array containing a  null in the careers", async () => {
      const { companyUuid, ...attributes } = offerAttributes;
      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: { ...attributes, careers: [null] }
      });
      expectApolloErrorToHaveInternalServerErrorMessage(errors);
    });

    it("returns an error if no careers are given", async () => {
      const { companyUuid, ...createOfferAttributes } = offerAttributes;

      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: { ...createOfferAttributes, careers: [] }
      });
      expect(errors).toEqualGraphQLErrorType(OfferWithNoCareersError.name);
    });
  });

  describe("when the currentUser does not comply the required permissions", () => {
    it("throws an error if no user is logged in", async () => {
      const { company } = await createCompanyTestClient(ApprovalStatus.approved);
      const apolloClient = client.loggedOut();
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid
      });
      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: createOfferAttributes
      });
      expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
    });

    it("throws an error if the current user is not a company", async () => {
      const { company } = await createCompanyTestClient(ApprovalStatus.approved);
      const { apolloClient } = await TestClientGenerator.applicant();
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid
      });
      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: createOfferAttributes
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the company has pending approval status", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.pending);
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid,
        careers: [{ careerCode: firstCareer.code }]
      });
      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: createOfferAttributes
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });

    it("returns an error if the company has rejected approval status", async () => {
      const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.rejected);
      const { companyUuid, ...createOfferAttributes } = OfferGenerator.data.withObligatoryData({
        companyUuid: company.uuid
      });
      const { errors } = await apolloClient.mutate({
        mutation: CREATE_OFFER,
        variables: createOfferAttributes
      });
      expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
    });
  });
});
