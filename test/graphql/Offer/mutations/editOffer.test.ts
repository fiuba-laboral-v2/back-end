import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";

import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { UserRepository } from "$models/User";
import { OfferNotFoundError, OfferRepository } from "$models/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Applicant";
import { Admin, Career } from "$models";

import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { CareerGenerator } from "$generators/Career";
import { AdminGenerator } from "$generators/Admin";
import { TestClientGenerator } from "$generators/TestClient";

import generateUuid from "uuid/v4";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { OfferNotVisibleByCurrentUserError } from "$graphql/Offer/Queries/Errors";

const EDIT_OFFER = gql`
  mutation editOffer(
    $uuid: ID!
    $title: String!
    $description: String!
    $targetApplicantType: ApplicantType!
    $hoursPerDay: Int!
    $minimumSalary: Int!
    $maximumSalary: Int!
    $sections: [OfferSectionInput]!
    $careers: [OfferCareerInput]!
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

  const createCompanyTestClient = async () =>
    TestClientGenerator.company({
      status: { admin, approvalStatus: ApprovalStatus.approved }
    });

  const expectToUpdateAttribute = async (attribute: string, newValue: any) => {
    const { apolloClient, company } = await createCompanyTestClient();
    const initialAttributes = OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid });
    const { uuid } = await OfferRepository.create(initialAttributes);
    await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: {
        uuid,
        sections: [],
        ...initialAttributes,
        [attribute]: newValue
      }
    });
    const updatedOffer = await OfferRepository.findByUuid(uuid);
    if (newValue !== initialAttributes[attribute]) {
      expect(updatedOffer[attribute]).not.toEqual(initialAttributes[attribute]);
    }
    expect(updatedOffer[attribute]).toEqual(newValue);
  };

  it("set both status to pending", async () => {
    const { apolloClient, company } = await createCompanyTestClient();
    const initialAttributes = OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid });
    const { uuid } = await OfferRepository.create(initialAttributes);
    await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { uuid, ...initialAttributes }
    });
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

  it("edits the section title", async () => {
    const {
      apolloClient,
      company: { uuid: companyUuid }
    } = await createCompanyTestClient();
    const sectionData = { title: "title", text: "text", displayOrder: 1 };
    const initialAttributes = OfferGenerator.data.withObligatoryData({
      companyUuid,
      sections: [sectionData]
    });
    const offer = await OfferRepository.create(initialAttributes);
    const [section] = await offer.getSections();
    const newSectionData = {
      uuid: section.uuid,
      title: "newTitle",
      text: "newText",
      displayOrder: 1
    };
    await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: {
        uuid: offer.uuid,
        ...initialAttributes,
        sections: [newSectionData]
      }
    });
    const [updatedSection] = await offer.getSections();
    expect(updatedSection).toBeObjectContaining({
      offerUuid: offer.uuid,
      ...newSectionData
    });
  });

  it("removes all careers by not providing any careerCode", async () => {
    const { apolloClient, company } = await createCompanyTestClient();
    const initialAttributes = OfferGenerator.data.withObligatoryData({
      companyUuid: company.uuid,
      sections: [],
      careers: [{ careerCode: firstCareer.code }, { careerCode: secondCareer.code }]
    });
    const offer = await OfferRepository.create(initialAttributes);
    expect(await offer.getCareers()).toHaveLength(2);

    await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { uuid: offer.uuid, ...initialAttributes, careers: [] }
    });
    expect(await offer.getCareers()).toHaveLength(0);
  });

  it("throws an error if the offer does not belong to the company", async () => {
    const { apolloClient } = await createCompanyTestClient();
    const anotherCompany = await CompanyGenerator.instance.withMinimumData();
    const initialAttributes = OfferGenerator.data.withObligatoryData({
      companyUuid: anotherCompany.uuid
    });
    const { uuid } = await OfferRepository.create(initialAttributes);

    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { uuid, ...initialAttributes }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotVisibleByCurrentUserError.name
    });
  });

  it("throws an error when the offer uuid is not found", async () => {
    const { apolloClient, company } = await createCompanyTestClient();
    const attributes = OfferGenerator.data.withObligatoryData({
      companyUuid: company.uuid,
      sections: []
    });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: {
        ...attributes,
        uuid: generateUuid()
      }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotFoundError.name
    });
  });

  it("throws an error if the user is not from a company", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const attributes = OfferGenerator.data.withObligatoryData({
      companyUuid: generateUuid(),
      sections: []
    });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { uuid: generateUuid(), ...attributes }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("throws an error when the user does not belong to an approved company", async () => {
    const { apolloClient, company } = await TestClientGenerator.company();
    const offerData = OfferGenerator.data.withObligatoryData({
      companyUuid: company.uuid,
      sections: []
    });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...offerData, uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
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
    expect(errors![0].extensions!.data).toEqual({
      errorType: AuthenticationError.name
    });
  });
});
