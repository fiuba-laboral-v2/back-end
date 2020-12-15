import { client } from "$test/graphql/ApolloTestClient";
import { gql } from "apollo-server";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";
import { GraphQLCompany } from "$graphql/Company/Types/GraphQLCompany";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { UnknownNotificationError } from "$models/Notification";
import {
  AdminNotification,
  AdminNotificationRepository,
  UpdatedCompanyProfileAdminNotification
} from "$models/AdminNotification";
import { Admin } from "$models";

import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { AdminNotificationGenerator } from "$generators/AdminNotification";
import { AdminGenerator } from "$generators/Admin";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { TestClientGenerator } from "$generators/TestClient";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

const GET_ADMIN_NOTIFICATIONS = gql`
  query GetAdminNotifications($updatedBeforeThan: PaginatedInput) {
    getAdminNotifications(updatedBeforeThan: $updatedBeforeThan) {
      results {
        ... on UpdatedCompanyProfileAdminNotification {
          __typename
          uuid
          isNew
          createdAt
          company {
            __typename
            uuid
          }
        }
      }
      shouldFetchMore
    }
  }
`;

describe("getAdminNotifications", () => {
  let graduadosAdmin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();

    graduadosAdmin = await AdminGenerator.graduados();
    await SecretarySettingsGenerator.createDefaultSettings();
  });

  const performQuery = (apolloClient: TestClient, updatedBeforeThan?: IPaginatedInput) => {
    const variables = updatedBeforeThan && {
      updatedBeforeThan: {
        ...updatedBeforeThan,
        dateTime: updatedBeforeThan?.dateTime.toISOString()
      }
    };
    return apolloClient.query({ query: GET_ADMIN_NOTIFICATIONS, variables });
  };

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: { approvalStatus, admin: graduadosAdmin } });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: { approvalStatus, admin: graduadosAdmin } });

  const getFields = (notification: AdminNotification) => {
    const notificationClassName = notification.constructor.name;
    switch (notificationClassName) {
      case UpdatedCompanyProfileAdminNotification.name:
        const approvedJobApplicationNotification = notification as UpdatedCompanyProfileAdminNotification;
        return {
          __typename: "UpdatedCompanyProfileAdminNotification",
          company: {
            __typename: GraphQLCompany.name,
            uuid: approvedJobApplicationNotification.companyUuid
          }
        };
    }
    throw new Error(`
      The local function getFields in the getAdminNotification test failed because
      it received an unknown notification: ${notificationClassName}
    `);
  };

  it("returns all notifications for extension admin", async () => {
    const secretary = Secretary.extension;
    const { apolloClient, admin } = await TestClientGenerator.admin({ secretary });
    const size = 5;
    const notifications = await AdminNotificationGenerator.instance.range({ admin, size });
    const { data, errors } = await performQuery(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.getAdminNotifications.results).toEqual(
      await Promise.all(
        notifications.map(async notification => ({
          uuid: notification.uuid,
          isNew: notification.isNew,
          createdAt: notification.createdAt?.toISOString(),
          ...getFields(notification)
        }))
      )
    );
  });

  it("returns the next three notifications", async () => {
    const size = 6;
    const itemsPerPage = size / 2;
    mockItemsPerPage(itemsPerPage);

    const secretary = Secretary.graduados;
    const { apolloClient, admin } = await TestClientGenerator.admin({ secretary });
    const notifications = await AdminNotificationGenerator.instance.range({ admin, size });
    const { data, errors } = await performQuery(apolloClient, {
      uuid: notifications[itemsPerPage - 1].uuid!,
      dateTime: notifications[itemsPerPage - 1].createdAt!
    });
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getAdminNotifications;
    const notificationUuids = notifications.map(({ uuid }) => uuid);

    expect(results).toHaveLength(itemsPerPage);
    expect(results.map(({ uuid }) => uuid)).toEqual(notificationUuids.slice(itemsPerPage, size));
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

  it("returns an error if the current user is an approved applicant", async () => {
    const { apolloClient } = await createApplicantTestClient(ApprovalStatus.approved);
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

  it("returns an error if the query returns an unknown notification", async () => {
    const secretary = Secretary.graduados;
    const { apolloClient } = await TestClientGenerator.admin({ secretary });
    const unknownNotification = { uuid: "uuid" } as AdminNotification;
    jest
      .spyOn(AdminNotificationRepository, "findLatestBySecretary")
      .mockImplementation(() =>
        Promise.resolve({ results: [unknownNotification], shouldFetchMore: false })
      );
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnknownNotificationError.name);
  });
});
