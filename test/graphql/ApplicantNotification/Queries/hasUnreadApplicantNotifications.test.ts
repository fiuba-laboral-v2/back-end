import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { ApplicantNotificationRepository } from "$models/ApplicantNotification";
import { ApplicantNotificationGenerator } from "$generators/ApplicantNotification";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { TestClientGenerator } from "$generators/TestClient";
import { client } from "$test/graphql/ApolloTestClient";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { Secretary } from "$models/Admin";

const HAS_UNREAD_APPLICANT_NOTIFICATIONS = gql`
  query HasUnreadApplicantNotifications {
    hasUnreadApplicantNotifications
  }
`;

describe("hasUnreadApplicantNotifications", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: approvalStatus });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  const performQuery = (apolloClient: TestClient) =>
    apolloClient.query({ query: HAS_UNREAD_APPLICANT_NOTIFICATIONS });

  it("returns true if there are unread notifications", async () => {
    const size = 10;
    const { apolloClient, applicant } = await createApplicantTestClient(ApprovalStatus.approved);
    const notifications = await ApplicantNotificationGenerator.instance.range({ applicant, size });
    let isNew = true;
    for (const notification of notifications) {
      notification.isNew = !isNew;
      isNew = !isNew;
      await ApplicantNotificationRepository.save(notification);
    }
    const { data, errors } = await performQuery(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.hasUnreadApplicantNotifications).toBe(true);
  });

  it("returns false if there is no notifications", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
    const { data, errors } = await performQuery(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.hasUnreadApplicantNotifications).toBe(false);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from an approved company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is an extension admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a graduados admin", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
