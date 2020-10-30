import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { client } from "$test/graphql/ApolloTestClient";

import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { UserRepository } from "$models/User";
import { OfferNotFoundError, OfferRepository } from "$models/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Applicant";
import { Admin, Career, Company } from "$models";

import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { CareerGenerator } from "$generators/Career";
import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";

import generateUuid from "uuid/v4";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { OfferNotVisibleByCurrentUserError } from "$graphql/Offer/Queries/Errors";
import { OfferWithNoCareersError } from "$graphql/Offer/Errors";
import { GraphQLFormattedError } from "graphql";
import { omit } from "lodash";

const EDIT_OFFER = gql`
  mutation editOffer(
    $uuid: ID!
    $title: String!
    $description: String!
    $targetApplicantType: ApplicantType!
    $hoursPerDay: Int!
    $minimumSalary: Int!
    $maximumSalary: Int
    $sections: [OfferSectionInput]!
    $careers: [OfferCareerInput!]!
  ) {
    editOffer(
      uuid: $uuid
      title: $title
      description: $description
      targetApplicantType: $targetApplicantType
      hoursPerDay: $hoursPerDay
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
    }
  }
`;

describe("editOffer", () => {
  let admin: Admin;
  let firstCareer: Career;
  let secondCareer: Career;

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    await CareerRepository.truncate();
    admin = await AdminGenerator.extension();
    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();
  });

  const createCompanyTestClient = async (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({
      status: { admin, approvalStatus }
    });

  const expectToUpdateAttribute = async (attribute: string, newValue: any) => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const initialAttributes = OfferGenerator.data.withObligatoryData({
      companyUuid: company.uuid,
      careers: [{ careerCode: firstCareer.code }, { careerCode: secondCareer.code }]
    });
    const { uuid } = await OfferRepository.create(initialAttributes);
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: {
        uuid,
        sections: [],
        ...initialAttributes,
        [attribute]: newValue
      }
    });
    expect(errors).toBeUndefined();
    const updatedOffer = await OfferRepository.findByUuid(uuid);
    if (newValue !== initialAttributes[attribute]) {
      expect(updatedOffer[attribute]).not.toEqual(initialAttributes[attribute]);
    }
    expect(updatedOffer[attribute]).toEqual(newValue);
  };

  it("set both status to pending", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const initialAttributes = OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid });
    const { uuid } = await OfferRepository.create(initialAttributes);
    await apolloClient.mutate({ mutation: EDIT_OFFER, variables: { uuid, ...initialAttributes } });
    const updatedOffer = await OfferRepository.findByUuid(uuid);
    expect(updatedOffer.graduadosApprovalStatus).toEqual(ApprovalStatus.pending);
    expect(updatedOffer.extensionApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("edits an offer title", async () => {
    await expectToUpdateAttribute("title", "Amazing Offer");
  });

  it("edits an offer description", async () => {
    await expectToUpdateAttribute("description", "new description");
  });

  it("edits an offer targetApplicantType to both student and graduate", async () => {
    await expectToUpdateAttribute("targetApplicantType", ApplicantType.both);
  });

  it("edits an offer targetApplicantType to student", async () => {
    await expectToUpdateAttribute("targetApplicantType", ApplicantType.student);
  });

  it("edits an offer targetApplicantType to graduate", async () => {
    await expectToUpdateAttribute("targetApplicantType", ApplicantType.graduate);
  });

  it("edits an offer hoursPerDay", async () => {
    await expectToUpdateAttribute("hoursPerDay", 15);
  });

  it("edits an offer minimumSalary", async () => {
    await expectToUpdateAttribute("minimumSalary", 1);
  });

  it("edits an offer maximumSalary", async () => {
    await expectToUpdateAttribute("maximumSalary", 10000);
  });

  it("removes an offer maximumSalary", async () => {
    await expectToUpdateAttribute("maximumSalary", null);
  });

  it("edits the section title", async () => {
    const {
      apolloClient,
      company: { uuid: companyUuid }
    } = await createCompanyTestClient(ApprovalStatus.approved);
    const sectionData = { title: "title", text: "text", displayOrder: 1 };
    const initialAttributes = OfferGenerator.data.withObligatoryData({
      companyUuid,
      sections: [sectionData],
      careers: [{ careerCode: firstCareer.code }]
    });
    const offer = await OfferRepository.create(initialAttributes);
    const [section] = await offer.getSections();
    const newSectionData = {
      uuid: section.uuid,
      title: "newTitle",
      text: "newText",
      displayOrder: 1
    };

    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: {
        uuid: offer.uuid,
        ...initialAttributes,
        sections: [newSectionData]
      }
    });
    expect(errors).toBeUndefined();
    const [updatedSection] = await offer.getSections();
    expect(updatedSection).toBeObjectContaining({ offerUuid: offer.uuid, ...newSectionData });
  });

  describe("when the input values are invalid", () => {
    let apolloClient: TestClient;
    let company: Company;

    beforeAll(async () => {
      const testClient = await createCompanyTestClient(ApprovalStatus.approved);
      apolloClient = testClient.apolloClient;
      company = testClient.company;
    });

    const createOfferAttributes = (companyUuid: string) =>
      OfferGenerator.data.withObligatoryData({ companyUuid });

    const expectApolloErrorToHaveInternalServerErrorMessage = (
      errors?: ReadonlyArray<GraphQLFormattedError>
    ) => expect(errors).toEqual([expect.objectContaining({ message: "Internal server error" })]);

    const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
      const { companyUuid, ...attributes } = createOfferAttributes(company.uuid);
      const { errors } = await apolloClient.mutate({
        mutation: EDIT_OFFER,
        variables: { uuid: generateUuid(), ...omit(attributes, attribute) }
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

    it("throws an error if no minimumSalary is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("minimumSalary");
    });

    it("throws an error if no sections is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("sections");
    });

    it("throws an error if no careers is provided", async () => {
      await expectToThrowErrorOnMissingAttribute("careers");
    });

    it("throws an error if given an array containing a  null in the careers", async () => {
      const { companyUuid, ...attributes } = createOfferAttributes(company.uuid);
      const { errors } = await apolloClient.mutate({
        mutation: EDIT_OFFER,
        variables: { uuid: generateUuid(), ...attributes, careers: [null] }
      });
      expectApolloErrorToHaveInternalServerErrorMessage(errors);
    });
  });

  it("returns an error if no career is provided", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const initialAttributes = OfferGenerator.data.withObligatoryData({
      companyUuid: company.uuid,
      sections: [],
      careers: [{ careerCode: firstCareer.code }, { careerCode: secondCareer.code }]
    });
    const offer = await OfferRepository.create(initialAttributes);
    expect(await offer.getCareers()).toHaveLength(2);

    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: {
        uuid: offer.uuid,
        ...initialAttributes,
        careers: []
      }
    });
    expect(errors).toEqualGraphQLErrorType(OfferWithNoCareersError.name);
  });

  it("throws an error if the offer does not belong to the company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
    const anotherCompany = await CompanyGenerator.instance.withMinimumData();
    const initialAttributes = OfferGenerator.data.withObligatoryData({
      companyUuid: anotherCompany.uuid,
      careers: [{ careerCode: firstCareer.code }]
    });
    const { uuid } = await OfferRepository.create(initialAttributes);

    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { uuid, ...initialAttributes }
    });
    expect(errors).toEqualGraphQLErrorType(OfferNotVisibleByCurrentUserError.name);
  });

  it("throws an error when the offer uuid is not found", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const attributes = OfferGenerator.data.withObligatoryData({
      companyUuid: company.uuid,
      sections: [],
      careers: [{ careerCode: firstCareer.code }]
    });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...attributes, uuid: generateUuid() }
    });
    expect(errors).toEqualGraphQLErrorType(OfferNotFoundError.name);
  });

  it("throws an error if the user is not from a company", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const attributes = OfferGenerator.data.withObligatoryData({
      companyUuid: generateUuid(),
      sections: []
    });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...attributes, uuid: generateUuid() }
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("throws an error when the user is from a rejected company", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.rejected);
    const offerData = OfferGenerator.data.withObligatoryData({
      companyUuid: company.uuid,
      sections: []
    });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...offerData, uuid: generateUuid() }
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("throws an error when the user is from a pending company", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.pending);
    const offerData = OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...offerData, uuid: generateUuid() }
    });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("throws an error when a user is not logged in", async () => {
    const apolloClient = client.loggedOut();
    const offerData = OfferGenerator.data.withObligatoryData({
      companyUuid: generateUuid(),
      sections: []
    });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...offerData, uuid: generateUuid() }
    });
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });
});
