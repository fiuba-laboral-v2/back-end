import { gql } from "apollo-server";
import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { TestClientGenerator } from "$generators/TestClient";
import { OfferRepository } from "$models/Offer";
import { OfferGenerator, TOfferDataGenerator } from "$generators/Offer";
import { client } from "../../ApolloTestClient";
import { AdminGenerator } from "$generators/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import generateUuid from "uuid/v4";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { OfferNotFound } from "$models/Offer/Errors";
import { Secretary } from "$models/Admin";

const EDIT_OFFER = gql`
  mutation editOffer(
    $uuid: ID!
    $title: String!
    $description: String!
    $hoursPerDay: Int!
    $minimumSalary: Int!
    $maximumSalary: Int!
  ) {
    editOffer(
      uuid: $uuid
      title: $title
      description: $description
      hoursPerDay: $hoursPerDay
      minimumSalary: $minimumSalary
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

  beforeAll(async () => {
    await CompanyRepository.truncate();
    await UserRepository.truncate();
    offersData = OfferGenerator.data.withObligatoryData();
  });

  it("edits an offer successfully", async () => {
    const { apolloClient, company } = await TestClientGenerator.company({
      status: {
        admin: await AdminGenerator.instance(Secretary.extension),
        approvalStatus: ApprovalStatus.approved,
      },
    });
    const initialAttributes = offersData.next({ companyUuid: company.uuid }).value;
    const { uuid } = await OfferRepository.create(initialAttributes);
    const newTitle = "Amazing Offer";
    await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...initialAttributes, uuid, title: newTitle },
    });
    const updatedOffer = await OfferRepository.findByUuid(uuid);
    expect(updatedOffer.title).not.toEqual(initialAttributes.title);
    expect(updatedOffer.title).toEqual(newTitle);
  });

  it("throws an error when the offer uuid is not found", async () => {
    const { apolloClient, company } = await TestClientGenerator.company({
      status: {
        admin: await AdminGenerator.instance(Secretary.extension),
        approvalStatus: ApprovalStatus.approved,
      },
    });
    const attributes = offersData.next({ companyUuid: company.uuid }).value;
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: {
        ...attributes,
        uuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e71",
      },
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: OfferNotFound.name,
    });
  });

  it("throws an error when the user does not belong to a company", async () => {
    const { apolloClient } = await TestClientGenerator.applicant();
    const attributes = offersData.next({
      companyUuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e72",
    }).value;
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: {
        ...attributes,
        uuid: "ca2c5210-cb79-4026-9a26-1eb7a4159e71",
      },
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name,
    });
  });

  it("throws an error when the user does not belong to an approved company", async () => {
    const { apolloClient } = await TestClientGenerator.company();
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...offersData.next().value, uuid: generateUuid() },
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: UnauthorizedError.name,
    });
  });

  it("throws an error when a user is not logged in", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await apolloClient.mutate({
      mutation: EDIT_OFFER,
      variables: { ...offersData.next().value, uuid: generateUuid() },
    });
    expect(errors![0].extensions!.data).toEqual({
      errorType: AuthenticationError.name,
    });
  });
});
