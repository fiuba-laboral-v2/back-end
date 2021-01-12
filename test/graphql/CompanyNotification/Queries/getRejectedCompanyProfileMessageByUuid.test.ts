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
import { Company } from "$models";

import { TestClientGenerator } from "$generators/TestClient";
import { CompanyGenerator } from "$generators/Company";
import { CompanyNotificationGenerator } from "$generators/CompanyNotification";

const GET_REJECTED_COMPANY_PROFILE_MESSAGE_BY_UUID = gql`
  query GetRejectedCompanyProfileMessageByUuid($notifiedCompanyUuid: ID!) {
    getRejectedCompanyProfileMessageByUuid(notifiedCompanyUuid: $notifiedCompanyUuid)
  }
`;

describe("getRejectedCompanyProfileMessageByUuid", () => {
  let company: Company;
  const generator = CompanyNotificationGenerator.instance;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    company = await CompanyGenerator.instance.withMinimumData();
  });

  const performQuery = (apolloClient: TestClient, notifiedCompanyUuid: string) => {
    return apolloClient.query({
      query: GET_REJECTED_COMPANY_PROFILE_MESSAGE_BY_UUID,
      variables: { notifiedCompanyUuid }
    });
  };

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: approvalStatus });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  it("returns the newest rejectionMessage for my company", async () => {
    const { apolloClient } = await TestClientGenerator.admin();
    await generator.rejectedProfile({ company });
    const secondNotification = await generator.rejectedProfile({ company });
    await generator.approvedProfile({ company });
    const { data, errors } = await performQuery(apolloClient, company.uuid);
    expect(errors).toBeUndefined();
    expect(data!.getRejectedCompanyProfileMessageByUuid).toEqual(
      secondNotification.moderatorMessage
    );
  });

  it("returns an error if the company has no notification", async () => {
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
