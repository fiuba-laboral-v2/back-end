import { client } from "$test/graphql/ApolloTestClient";
import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { UnknownNotificationError } from "$models/Notification";
import {
  ApplicantNotification,
  ApplicantNotificationRepository,
  ApprovedJobApplicationApplicantNotification
} from "$models/ApplicantNotification";
import { Admin } from "$models";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { ApplicantNotificationGenerator } from "$generators/ApplicantNotification";
import { AdminGenerator } from "$generators/Admin";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { TestClientGenerator } from "$generators/TestClient";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

const GET_APPLICANT_NOTIFICATIONS = gql`
  query GetApplicantNotifications($updatedBeforeThan: PaginatedInput) {
    getApplicantNotifications(updatedBeforeThan: $updatedBeforeThan) {
      results {
        ... on ApprovedJobApplicationApplicantNotification {
          __typename
          uuid
          adminEmail
          isNew
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

describe("getApplicantNotifications", () => {
  let admin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();

    admin = await AdminGenerator.graduados();
    await SecretarySettingsGenerator.createDefaultSettings();
  });

  const performQuery = (apolloClient: TestClient, updatedBeforeThan?: IPaginatedInput) => {
    const variables = updatedBeforeThan && {
      updatedBeforeThan: {
        ...updatedBeforeThan,
        dateTime: updatedBeforeThan?.dateTime.toISOString()
      }
    };
    return apolloClient.query({ query: GET_APPLICANT_NOTIFICATIONS, variables });
  };

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: { approvalStatus, admin } });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: { approvalStatus, admin } });

  it("returns all notifications", async () => {
    const { apolloClient, applicant } = await createApplicantTestClient(ApprovalStatus.approved);
    const size = 5;
    const notifications = await ApplicantNotificationGenerator.instance.range({ applicant, size });
    const { data, errors } = await performQuery(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.getApplicantNotifications.results).toEqual(
      await Promise.all(
        notifications.map(async notification => ({
          uuid: notification.uuid,
          adminEmail: (await UserRepository.findByUuid(notification.moderatorUuid)).email,
          isNew: notification.isNew,
          createdAt: notification.createdAt?.toISOString(),
          __typename: "ApprovedJobApplicationApplicantNotification",
          jobApplication: {
            __typename: GraphQLJobApplication.name,
            uuid: (notification as ApprovedJobApplicationApplicantNotification).jobApplicationUuid
          }
        }))
      )
    );
  });

  it("returns the next three notifications", async () => {
    const size = 6;
    const itemsPerPage = size / 2;
    mockItemsPerPage(itemsPerPage);
    const { apolloClient, applicant } = await createApplicantTestClient(ApprovalStatus.approved);
    const notifications = await ApplicantNotificationGenerator.instance.range({ applicant, size });
    const { data, errors } = await performQuery(apolloClient, {
      uuid: notifications[itemsPerPage - 1].uuid!,
      dateTime: notifications[itemsPerPage - 1].createdAt!
    });
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getApplicantNotifications;
    const notificationUuids = notifications.map(({ uuid }) => uuid);

    expect(results).toHaveLength(itemsPerPage);
    expect(results.map(({ uuid }) => uuid)).toEqual(notificationUuids.slice(itemsPerPage, size));
    expect(shouldFetchMore).toBe(false);
  });

  it("updates the returned notifications isNew value to false", async () => {
    const { apolloClient, applicant } = await createApplicantTestClient(ApprovalStatus.approved);
    const size = 10;
    const notifications = await ApplicantNotificationGenerator.instance.range({ applicant, size });
    const { data, errors } = await performQuery(apolloClient);
    expect(errors).toBeUndefined();
    const uuids = notifications.map(({ uuid }) => uuid!);
    const persistedNotifications = await ApplicantNotificationRepository.findByUuids(uuids);
    const { results, shouldFetchMore } = data!.getApplicantNotifications;

    expect(results).toHaveLength(size);
    results.map(notification => expect(notification.isNew).toBe(true));
    persistedNotifications.map(notification => expect(notification.isNew).toBe(false));
    expect(shouldFetchMore).toBe(false);
  });

  it("updates the last five notifications isNew value to false", async () => {
    const size = 10;
    const itemsPerPage = size / 2;
    mockItemsPerPage(itemsPerPage);
    const { apolloClient, applicant } = await createApplicantTestClient(ApprovalStatus.approved);
    const notifications = await ApplicantNotificationGenerator.instance.range({ applicant, size });
    const { data, errors } = await performQuery(apolloClient, {
      uuid: notifications[itemsPerPage - 1].uuid!,
      dateTime: notifications[itemsPerPage - 1].createdAt!
    });
    expect(errors).toBeUndefined();
    const uuids = notifications.slice(itemsPerPage + 1, size).map(({ uuid }) => uuid!);
    const persistedNotifications = await ApplicantNotificationRepository.findByUuids(uuids);
    const { results, shouldFetchMore } = data!.getApplicantNotifications;

    expect(results).toHaveLength(itemsPerPage);
    results.map(notification => expect(notification.isNew).toBe(true));
    persistedNotifications.map(notification => expect(notification.isNew).toBe(false));
    expect(shouldFetchMore).toBe(false);
  });

  it("returns an error if there is no current user", async () => {
    const apolloClient = client.loggedOut();
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(AuthenticationError.name);
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

  it("returns an error if the current user is from a rejected company", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a rejected applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.rejected);
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnauthorizedError.name);
  });

  it("returns an error if the current user is a pending applicant", async () => {
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

  it("returns an error if the query returns an unknown notification", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
    const unknownNotification = { uuid: "uuid" } as ApplicantNotification;
    jest
      .spyOn(ApplicantNotificationRepository, "findLatestByApplicant")
      .mockImplementation(() =>
        Promise.resolve({ results: [unknownNotification], shouldFetchMore: false })
      );
    jest.spyOn(ApplicantNotificationRepository, "markAsReadByUuids").mockImplementation(jest.fn());
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnknownNotificationError.name);
  });
});
