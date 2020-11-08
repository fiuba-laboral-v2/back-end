import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { AdminRepository, Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin, Notification } from "$models";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";

import { TestClientGenerator } from "$generators/TestClient";
import { NotificationGenerator } from "$generators/Notification";
import { AdminGenerator } from "$generators/Admin";

import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { range } from "lodash";
import MockDate from "mockdate";

const GET_NOTIFICATIONS = gql`
  query GetNotifications($updatedBeforeThan: PaginatedInput) {
    getNotifications(updatedBeforeThan: $updatedBeforeThan) {
      results {
        ... on JobApplicationNotification {
          __typename
          uuid
          adminEmail
          message
          createdAt
          user {
            uuid
          }
          jobApplication {
            __typename
            uuid
          }
        }
      }
      shouldFetchMore
    }
  }
`;

describe("getNotifications", () => {
  let admin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    admin = await AdminGenerator.graduados();
  });

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: { approvalStatus, admin } });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: { approvalStatus, admin } });

  it("returns all notification for a companyUser", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const notification = await NotificationGenerator.instance.JobApplication.approved(company);
    const { data, errors } = await apolloClient.query({ query: GET_NOTIFICATIONS });
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getNotifications;
    const { userUuid } = await AdminRepository.findByUserUuid(notification.adminUserUuid);
    const adminUser = await UserRepository.findByUuid(userUuid);
    expect(results).toEqual([
      {
        __typename: "JobApplicationNotification",
        uuid: notification.uuid,
        user: { uuid: notification.userUuid },
        adminEmail: adminUser.email,
        jobApplication: {
          __typename: GraphQLJobApplication.name,
          uuid: notification.jobApplicationUuid
        },
        message: null,
        createdAt: notification.createdAt.toISOString()
      }
    ]);
    expect(shouldFetchMore).toBe(false);
  });

  it("returns the first three notifications for a companyUser", async () => {
    const itemsPerPage = 3;
    mockItemsPerPage(itemsPerPage);
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const notifications: Notification[] = [];
    for (const milliseconds of range(20)) {
      MockDate.set(milliseconds);
      notifications.push(await NotificationGenerator.instance.JobApplication.approved(company));
      MockDate.reset();
    }
    const { data, errors } = await apolloClient.query({ query: GET_NOTIFICATIONS });
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getNotifications;
    expect(results).toHaveLength(itemsPerPage);
    expect(results.map(({ uuid }) => uuid)).toEqual(
      notifications
        .sort(({ createdAt }) => -createdAt)
        .map(task => task.uuid)
        .slice(0, itemsPerPage)
    );
    expect(shouldFetchMore).toBe(true);
  });

  it("returns all notifications for the currently logged in admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { data, errors } = await apolloClient.query({ query: GET_NOTIFICATIONS });
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getNotifications;
    expect(results).toHaveLength(0);
    expect(shouldFetchMore).toBe(false);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await apolloClient.query({ query: GET_NOTIFICATIONS });
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await apolloClient.query({ query: GET_NOTIFICATIONS });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const { errors } = await apolloClient.query({ query: GET_NOTIFICATIONS });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await apolloClient.query({ query: GET_NOTIFICATIONS });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await apolloClient.query({ query: GET_NOTIFICATIONS });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });
});
