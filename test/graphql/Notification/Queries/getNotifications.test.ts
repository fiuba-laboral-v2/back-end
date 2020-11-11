import { Promise as SequelizePromise } from "sequelize";
import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";
import { client } from "$test/graphql/ApolloTestClient";

import { MissingNotificationTypeError, NotificationRepository } from "$models/Notification";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin, Notification } from "$models";

import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";

import { TestClientGenerator } from "$generators/TestClient";
import { NotificationGenerator } from "$generators/Notification";
import { AdminGenerator } from "$generators/Admin";

import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { range } from "lodash";
import MockDate from "mockdate";
import { JobApplicationGenerator } from "$generators/JobApplication";
import { SecretarySettingsRepository } from "$src/models/SecretarySettings";
import { SecretarySettingsGenerator } from "$test/generators/SecretarySettings";

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
    await SecretarySettingsRepository.truncate();

    admin = await AdminGenerator.graduados();
    await SecretarySettingsGenerator.createDefaultSettings();
  });

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: { approvalStatus, admin } });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: { approvalStatus, admin } });

  const getNotifications = (apolloClient: TestClient, updatedBeforeThan?: IPaginatedInput) => {
    const variables = {
      updatedBeforeThan: {
        ...updatedBeforeThan,
        dateTime: updatedBeforeThan?.dateTime.toISOString()
      }
    };
    return apolloClient.query({
      query: GET_NOTIFICATIONS,
      ...(updatedBeforeThan && { variables })
    });
  };

  it("returns all notifications for a companyUser", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const notification = await NotificationGenerator.instance.JobApplication.approved(company);
    const { data, errors } = await getNotifications(apolloClient);
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getNotifications;
    const adminUser = await UserRepository.findByUuid(notification.adminUserUuid);
    expect(results).toEqual([
      {
        __typename: "JobApplicationNotification",
        uuid: notification.uuid,
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

  it("returns the next three notifications for a companyUser", async () => {
    const itemsPerPage = 3;
    mockItemsPerPage(itemsPerPage);
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    let notifications: Notification[] = [];
    for (const milliseconds of range(20)) {
      MockDate.set(milliseconds);
      notifications.push(await NotificationGenerator.instance.JobApplication.approved(company));
      MockDate.reset();
    }
    notifications = notifications.sort(({ createdAt }) => -createdAt);

    const halfNotificationIndex = 10;
    const { data, errors } = await getNotifications(apolloClient, {
      uuid: notifications[halfNotificationIndex].uuid,
      dateTime: notifications[halfNotificationIndex].createdAt
    });
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getNotifications;
    expect(results).toHaveLength(itemsPerPage);
    expect(results.map(({ uuid }) => uuid)).toEqual(
      notifications
        .map(task => task.uuid)
        .slice(halfNotificationIndex + 1, halfNotificationIndex + 1 + itemsPerPage)
    );
    expect(shouldFetchMore).toBe(true);
  });

  it("returns all notifications for the currently logged in admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const { data, errors } = await getNotifications(apolloClient);
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getNotifications;
    expect(results).toHaveLength(0);
    expect(shouldFetchMore).toBe(false);
  });

  it("returns all notifications for the currently logged in applicant", async () => {
    const { apolloClient, user } = await createApplicantTestClient(ApprovalStatus.approved);

    const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
    const notification = await NotificationGenerator.instance.JobApplication.from(
      jobApplication,
      user
    );

    const { data, errors } = await getNotifications(apolloClient);
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getNotifications;
    const adminUser = await UserRepository.findByUuid(notification.adminUserUuid);

    expect(results).toEqual([
      {
        __typename: "JobApplicationNotification",
        uuid: notification.uuid,
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

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await getNotifications(apolloClient);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
  });

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await apolloClient.query({ query: GET_NOTIFICATIONS });
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a pending company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.pending);
    const { errors } = await getNotifications(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await getNotifications(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is from a pending applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.pending);
    const { errors } = await getNotifications(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the notification has no type", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const notification = await NotificationGenerator.instance.JobApplication.approved(company);
    notification.jobApplicationUuid = null as any;
    jest
      .spyOn(NotificationRepository, "findLatestByUser")
      .mockImplementation(async () => ({ results: [notification], shouldFetchMore: false }));
    jest
      .spyOn(NotificationRepository, "save")
      .mockReturnValue((notification as unknown) as SequelizePromise<Notification>);
    const { errors } = await getNotifications(apolloClient);
    expect(errors).toEqualGraphQLErrorType(MissingNotificationTypeError.name);
  });
});
