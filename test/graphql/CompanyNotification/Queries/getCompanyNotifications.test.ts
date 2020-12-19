import { gql } from "apollo-server";
import { client } from "$test/graphql/ApolloTestClient";
import { ApolloServerTestClient as TestClient } from "apollo-server-testing/dist/createTestClient";

import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLJobApplication } from "$graphql/JobApplication/Types/GraphQLJobApplication";
import { GraphQLOffer } from "$graphql/Offer/Types/GraphQLOffer";
import { AuthenticationError, UnauthorizedError } from "$graphql/Errors";

import { UserRepository } from "$models/User";
import { AdminRepository } from "$models/Admin";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { UnknownNotificationError } from "$models/Notification";
import {
  NewJobApplicationCompanyNotification,
  ApprovedOfferCompanyNotification,
  RejectedOfferCompanyNotification,
  ApprovedProfileCompanyNotification,
  RejectedProfileCompanyNotification,
  CompanyNotificationRepository,
  CompanyNotification
} from "$models/CompanyNotification";
import { SecretarySettingsRepository } from "$models/SecretarySettings";

import { SecretarySettingsGenerator } from "$generators/SecretarySettings";
import { TestClientGenerator } from "$generators/TestClient";
import { CompanyNotificationGenerator } from "$generators/CompanyNotification";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

const GET_COMPANY_NOTIFICATIONS = gql`
  query GetCompanyNotifications($updatedBeforeThan: PaginatedInput) {
    getCompanyNotifications(updatedBeforeThan: $updatedBeforeThan) {
      results {
        ... on NewJobApplicationCompanyNotification {
          __typename
          uuid
          adminEmail
          isNew
          createdAt
          moderatorSecretary
          jobApplication {
            __typename
            uuid
          }
        }
        ... on ApprovedOfferCompanyNotification {
          __typename
          uuid
          adminEmail
          isNew
          createdAt
          moderatorSecretary
          offer {
            __typename
            uuid
          }
        }
        ... on RejectedOfferCompanyNotification {
          __typename
          uuid
          adminEmail
          moderatorMessage
          isNew
          createdAt
          moderatorSecretary
          offer {
            __typename
            uuid
          }
        }
        ... on ApprovedProfileCompanyNotification {
          __typename
          uuid
          adminEmail
          isNew
          createdAt
          moderatorSecretary
        }
        ... on ApprovedProfileCompanyNotification {
          __typename
          uuid
          adminEmail
          isNew
          createdAt
          moderatorSecretary
        }
        ... on RejectedProfileCompanyNotification {
          __typename
          uuid
          adminEmail
          moderatorMessage
          isNew
          createdAt
          moderatorSecretary
        }
      }
      shouldFetchMore
    }
  }
`;

describe("getCompanyNotifications", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await SecretarySettingsRepository.truncate();

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
    TestClientGenerator.company({ status: approvalStatus });

  const createApplicantTestClient = (approvalStatus: ApprovalStatus) =>
    TestClientGenerator.applicant({ status: approvalStatus });

  const getFields = (notification: CompanyNotification) => {
    const notificationClassName = notification.constructor.name;
    switch (notificationClassName) {
      case NewJobApplicationCompanyNotification.name:
        const newJobApplicationNotification = notification as NewJobApplicationCompanyNotification;
        return {
          __typename: "NewJobApplicationCompanyNotification",
          jobApplication: {
            __typename: GraphQLJobApplication.name,
            uuid: newJobApplicationNotification.jobApplicationUuid
          }
        };
      case ApprovedOfferCompanyNotification.name:
        const approvedOfferNotification = notification as ApprovedOfferCompanyNotification;
        return {
          __typename: "ApprovedOfferCompanyNotification",
          offer: {
            __typename: GraphQLOffer.name,
            uuid: approvedOfferNotification.offerUuid
          }
        };
      case RejectedOfferCompanyNotification.name:
        const rejectedOfferNotification = notification as RejectedOfferCompanyNotification;
        return {
          __typename: "RejectedOfferCompanyNotification",
          moderatorMessage: rejectedOfferNotification.moderatorMessage,
          offer: {
            __typename: GraphQLOffer.name,
            uuid: rejectedOfferNotification.offerUuid
          }
        };
      case ApprovedProfileCompanyNotification.name:
        return {
          __typename: "ApprovedProfileCompanyNotification"
        };
      case RejectedProfileCompanyNotification.name:
        const rejectedProfileNotification = notification as RejectedProfileCompanyNotification;
        return {
          __typename: "RejectedProfileCompanyNotification",
          moderatorMessage: rejectedProfileNotification.moderatorMessage
        };
    }
    throw new Error(`
      The local function getFields in the getCompanyNotification test failed because
      it received an unknown notification: ${notificationClassName}
    `);
  };

  it("returns all notifications", async () => {
    const { apolloClient, company } = await createCompanyTestClient(ApprovalStatus.approved);
    const size = 5;
    const notifications = await CompanyNotificationGenerator.instance.range({ company, size });
    const { data, errors } = await performQuery(apolloClient);

    expect(errors).toBeUndefined();
    expect(data!.getCompanyNotifications.results).toEqual(
      await Promise.all(
        notifications.map(async notification => {
          const { secretary } = await AdminRepository.findByUserUuid(notification.moderatorUuid);
          const settings = await SecretarySettingsRepository.findBySecretary(secretary);
          return {
            uuid: notification.uuid,
            moderatorSecretary: secretary,
            adminEmail: settings.email,
            isNew: notification.isNew,
            createdAt: notification.createdAt?.toISOString(),
            ...getFields(notification)
          };
        })
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

  it("returns an error if the query returns an unknown notification", async () => {
    const { apolloClient } = await createCompanyTestClient(ApprovalStatus.approved);
    const unknownNotification = { uuid: "uuid" } as CompanyNotification;
    jest
      .spyOn(CompanyNotificationRepository, "findLatestByCompany")
      .mockReturnValue(Promise.resolve({ results: [unknownNotification], shouldFetchMore: false }));
    jest.spyOn(CompanyNotificationRepository, "markAsReadByUuids").mockImplementation(jest.fn());
    const { errors } = await performQuery(apolloClient);
    expect(errors).toEqualGraphQLErrorType(UnknownNotificationError.name);
  });
});
