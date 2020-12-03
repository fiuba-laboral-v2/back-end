import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { Admin } from "$models";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import {
  CompanyNewJobApplicationNotification,
  CompanyNotificationRepository,
  TCompanyNotification,
  UnknownNotificationError
} from "$models/CompanyNotification";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { AdminGenerator } from "$generators/Admin";
import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyNotificationGenerator } from "$generators/CompanyNotification";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

const GET_COMPANY_NOTIFICATIONS = gql`
  query GetCompanyNotifications($updatedBeforeThan: PaginatedInput) {
    getCompanyNotifications(updatedBeforeThan: $updatedBeforeThan) {
      results {
        ... on CompanyNewJobApplicationNotification {
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
        ... on CompanyApprovedOfferNotification {
          __typename
          uuid
          adminEmail
          isNew
          createdAt
          offer {
            __typename
            uuid
          }
        }
      }
      shouldFetchMore
    }
  }
`;

describe("getCompanyNotifications", () => {
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
    const variables = {
      updatedBeforeThan: {
        ...updatedBeforeThan,
        dateTime: updatedBeforeThan?.dateTime.toISOString()
      }
    };
    return apolloClient.query({
      query: GET_COMPANY_NOTIFICATIONS,
      ...(updatedBeforeThan && { variables })
    });
  };

  const createCompanyTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.company({ status: { approvalStatus, admin } });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: { approvalStatus, admin } });

  const getAttributesFrom = (notification: TCompanyNotification) => {
    if (notification instanceof CompanyNewJobApplicationNotification) {
      return {
        __typename: "CompanyNewJobApplicationNotification",
        jobApplication: {
          __typename: GraphQLJobApplication.name,
          uuid: notification.jobApplicationUuid
        }
      };
    }

    return {
      __typename: "CompanyApprovedOfferNotification",
      offer: {
        __typename: GraphQLOffer.name,
        uuid: notification.offerUuid
      }
    };
  };

  it("returns all notifications", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const size = 5;
    const notifications = await CompanyNotificationGenerator.instance.range({ company, size });
    const { data, errors } = await performQuery(apolloClient);
    expect(errors).toBeUndefined();
    expect(data!.getCompanyNotifications.results).toEqual(
      await Promise.all(
        notifications.map(async notification => ({
          uuid: notification.uuid,
          adminEmail: (await UserRepository.findByUuid(notification.moderatorUuid)).email,
          isNew: notification.isNew,
          createdAt: notification.createdAt?.toISOString(),
          ...getAttributesFrom(notification)
        }))
      )
    );
  });

  it("returns the next three notifications", async () => {
    const size = 6;
    const itemsPerPage = size / 2;
    mockItemsPerPage(itemsPerPage);
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const notifications = await CompanyNotificationGenerator.instance.range({ company, size });
    const { data, errors } = await performQuery(apolloClient, {
      uuid: notifications[itemsPerPage - 1].uuid!,
      dateTime: notifications[itemsPerPage - 1].createdAt!
    });
    expect(errors).toBeUndefined();
    const { results, shouldFetchMore } = data!.getCompanyNotifications;
    const notificationUuids = notifications.map(({ uuid }) => uuid);

    expect(results).toHaveLength(itemsPerPage);
    expect(results.map(({ uuid }) => uuid)).toEqual(notificationUuids.slice(itemsPerPage, size));
    expect(shouldFetchMore).toBe(false);
  });

  it("updates all returned notifications isNew value to false", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const size = 10;
    const notifications = await CompanyNotificationGenerator.instance.range({ company, size });
    const { data, errors } = await performQuery(apolloClient);
    expect(errors).toBeUndefined();
    const uuids = notifications.map(({ uuid }) => uuid!);
    const persistedNotifications = await CompanyNotificationRepository.findByUuids(uuids);
    const { results, shouldFetchMore } = data!.getCompanyNotifications;

    expect(results.map(result => result.isNew)).toEqual(notifications.map(({ isNew }) => isNew));
    expect(persistedNotifications.map(result => result.isNew)).toEqual(Array(size).fill(false));
    expect(results).toHaveLength(size);
    expect(shouldFetchMore).toBe(false);
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

  it("returns an error if the current user is a approved applicant", async () => {
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

  it("returns an error the query returns an unknown notification", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
    const unknownNotification = { uuid: "uuid" } as TCompanyNotification;
    jest
      .spyOn(CompanyNotificationRepository, "findLatestByCompany")
      .mockReturnValue(Promise.resolve({ results: [unknownNotification], shouldFetchMore: false }));
    jest.spyOn(CompanyNotificationRepository, "markAsReadByUuids").mockImplementation(jest.fn());
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnknownNotificationError.name);
  });
});
