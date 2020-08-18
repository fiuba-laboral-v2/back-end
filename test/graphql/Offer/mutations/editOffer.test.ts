import { gql } from "apollo-server";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { TestClientGenerator } from "$generators/TestClient";
import { OfferRepository } from "$models/Offer";
import { OfferGenerator } from "$generators/Offer";
import { client } from "../../ApolloTestClient";
import { AdminGenerator } from "$generators/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import generateUuid from "uuid/v4";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { OfferNotUpdatedError } from "$models/Offer/Errors";
import { Secretary } from "$models/Admin";
import { TargetApplicantType } from "$models/Offer";

const EDIT_OFFER = gql`
  mutation editOffer(
    $uuid: ID!
    $title: String!
    $description: String!
    $targetApplicantType: TargetApplicantType!
    $hoursPerDay: Int!
    $minimumSalary: Int!
    $maximumSalary: Int!
  ) {
    editOffer(
      uuid: $uuid
      title: $title
      description: $description
      targetApplicantType: $targetApplicantType
      hoursPerDay: $hoursPerDay
      minimumSalary: $minimumSalary
      maximumSalary: $maximumSalary
    ) {
      uuid
      title
      description
      targetApplicantType
      hoursPerDay
      minimumSalary
      maximumSalary
    }
  }
`;

describe("editOffer", () => {
  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
  });

  const expectToUpdateAttribute = async (attribute: string, newValue: any) => {
    const {
      apolloClient,
      company: { uuid: companyUuid }
    } = await TestClientGenerator.company({
      status: {
        admin: await AdminGenerator.instance({ secretary: Secretary.extension }),
        approvalStatus: ApprovalStatus.approved
      }
    });
    const initialAttributes = OfferGenerator.data.withObligatoryData({ companyUuid });
    const { uuid } = await OfferRepository.create(initialAttributes);
    await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...initialAttributes, uuid, [attribute]: newValue }
    });
    const updatedOffer = await OfferRepository.findByUuid(uuid);
    expect(updatedOffer[attribute]).not.toEqual(initialAttributes[attribute]);
    expect(updatedOffer[attribute]).toEqual(newValue);
  };

  it("edits an offer title", async () => {
    await expectToUpdateAttribute("title", "Amazing Offer");
  });

  it("edits an offer description", async () => {
    await expectToUpdateAttribute("description", "new description");
  });

  it("edits an offer targetApplicantType to student", async () => {
    await expectToUpdateAttribute("targetApplicantType", TargetApplicantType.student);
  });

  it("edits an offer targetApplicantType to graduate", async () => {
    await expectToUpdateAttribute("targetApplicantType", TargetApplicantType.graduate);
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

  it("throws an error when the offer uuid is not found", async () => {
    const { apolloClient, company } = await TestClientGenerator.company({
      status: {
        admin: await AdminGenerator.instance({ secretary: Secretary.extension }),
        approvalStatus: ApprovalStatus.approved
      }
    });
    const attributes = OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: {
        ...attributes,
        uuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e71"
      }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotUpdatedError.name
    });
  });

  it("throws an error when the user does not belong to a company", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const attributes = OfferGenerator.data.withObligatoryData({
      companyUuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e72"
    });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: {
        ...attributes,
        uuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e71"
      }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name
    });
  });

  it("throws an error when the user does not belong to an approved company", async () => {
    const { apolloClient, company } = await TestClientGenerator.company();
    const offerData = OfferGenerator.data.withObligatoryData({ companyUuid: company.uuid });
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
    const offerData = OfferGenerator.data.withObligatoryData({ companyUuid: generateUuid() });
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...offerData, uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: AuthenticationError.name
    });
  });
});
