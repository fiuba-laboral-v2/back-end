import { gql } from "apollo-server";
import { Database } from "../../../../src/config/Database";
import { CompanyRepository } from "../../../../src/models/Company";
import { UserRepository } from "../../../../src/models/User";
import { testClientFactory } from "../../../mocks/testClientFactory";
import { OfferRepository } from "../../../../src/models/Offer";
import { OfferGenerator, TOfferDataGenerator } from "../../../generators/Offer";
import { client } from "../../ApolloTestClient";
import { AdminGenerator, TAdminGenerator } from "../../../generators/Admin";
import { ApprovalStatus } from "../../../../src/models/ApprovalStatus";
import generateUuid from "uuid/v4";
import { AuthenticationError, UnauthorizedError } from "../../../../src/graphql/Errors";
import { OfferNotFound } from "../../../../src/models/Offer/Errors";

const EDIT_OFFER = gql`
    mutation editOffer(
        $uuid: ID!,
        $title: String!,
        $description: String!,
        $hoursPerDay: Int!,
        $minimumSalary: Int!,
        $maximumSalary: Int!
    ) {
        editOffer(
            uuid: $uuid,
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

describe("editOffer", () => {
  let offersData: TOfferDataGenerator;
  let admins: TAdminGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    offersData = OfferGenerator.data.withObligatoryData();
    admins = AdminGenerator.instance();
  });
  afterAll(() => Database.close());

  it("edits an offer successfully", async () => {
    const { apolloClient, company } = await testClientFactory.company({
      status: {
        admin: await admins.next().value,
        approvalStatus: ApprovalStatus.approved
      }
    });
    const initialAttributes = offersData.next({ companyUuid: company.uuid }).value;
    const { uuid } = await OfferRepository.create(initialAttributes);
    const newTitle = "Amazing Offer";
    await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...initialAttributes, uuid, title: newTitle }
    });
    const updatedOffer = await OfferRepository.findByUuid(uuid);
    expect(updatedOffer.title).not.toEqual(initialAttributes.title);
    expect(updatedOffer.title).toEqual(newTitle);
  });

  it("throws an error when the offer uuid is not found", async () => {
    const { apolloClient, company } = await testClientFactory.company({
      status: {
        admin: await admins.next().value,
        approvalStatus: ApprovalStatus.approved
      }
    });
    const attributes = offersData.next({ companyUuid: company.uuid }).value;
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...attributes, uuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e71" }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: OfferNotFound.name });
  });

  it("throws an error when the user does not belong to a company", async () => {
    const { apolloClient } = await testClientFactory.applicant();
    const attributes = offersData.next({
      companyUuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e72"
    }).value;
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...attributes, uuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e71" }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("throws an error when the user does not belong to an approved company", async () => {
    const { apolloClient } = await testClientFactory.company();
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...offersData.next().value, uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
  });

  it("throws an error when a user is not logged in", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...offersData.next().value, uuid: generateUuid() }
    });
    expect(errors![0].extensions!.data).toEqual({ errorType: AuthenticationError.name });
  });
});
