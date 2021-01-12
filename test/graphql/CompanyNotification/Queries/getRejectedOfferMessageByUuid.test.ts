import { client } from "$test/graphql/ApolloTestClient";
import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { CompanyNotificationNotFoundError } from "$models/CompanyNotification/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { UUID } from "$models/UUID";
import { Offer } from "$models";

import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$generators/Offer";
import { CompanyNotificationGenerator } from "$generators/CompanyNotification";

const GET_REJECTED_OFFER_MESSAGE_BY_UUID = gql`
  query GetRejectedOfferMessageByUuid($offerUuid: ID!) {
    getRejectedOfferMessageByUuid(offerUuid: $offerUuid)
  }
`;

describe("getRejectedOfferMessageByUuid", () => {
  let offer: Offer;
  const generator = CompanyNotificationGenerator.instance;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
  });

  const performQuery = (apolloClient: TestClient, offerUuid: string) => {
    return apolloClient.query({
      query: GET_REJECTED_OFFER_MESSAGE_BY_UUID,
      variables: { offerUuid }
    });
  };

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: approvalStatus });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  it("returns the newest rejectionMessage for my offer", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    await generator.rejectedOffer({ offer });
    const secondNotification = await generator.rejectedOffer({ offer });
    await generator.approvedOffer({ offer });
    const { data, errors } = await performQuery(apolloClient, offer.uuid);
    expect(errors).toBeUndefined();
    expect(data!.getRejectedOfferMessageByUuid).toEqual(secondNotification.moderatorMessage);
  });

  it("returns an error if the offer has no notification", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(CompanyNotificationNotFoundError.name);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from an approved company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an approved applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient, UUID.generate());
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
