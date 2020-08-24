import { gql } from "apollo-server";
import { ApolloServerTestClient } from "apollo-server-testing";

import { CompanyRepository } from "$models/Company";
import { AdminTask, AdminTaskType, IAdminTasksFilter } from "$models/AdminTask";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UserRepository } from "$models/User";
import { UnauthorizedError } from "$graphql/Errors";

import { AdminTaskTestSetup } from "$setup/AdminTask";
import { TestClientGenerator } from "$generators/TestClient";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { Secretary } from "$models/Admin";
import { OfferRepository } from "$models/Offer";

const GET_ADMIN_TASKS = gql`
  query GetAdminTasks(
    $adminTaskTypes: [AdminTaskType]!
    $statuses: [ApprovalStatus]!
    $updatedBeforeThan: PaginatedInput
  ) {
    getAdminTasks(
      adminTaskTypes: $adminTaskTypes
      statuses: $statuses
      updatedBeforeThan: $updatedBeforeThan
    ) {
      results {
        ... on Company {
          __typename
          uuid
        }
        ... on Applicant {
          __typename
          uuid
        }
        ... on Offer {
          __typename
          uuid
        }
        ... on JobApplication {
          __typename
          uuid
        }
      }
      shouldFetchMore
    }
  }
`;

describe("getAdminTasks", () => {
  let setup: AdminTaskTestSetup;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await OfferRepository.truncate();
    setup = new AdminTaskTestSetup(true);
    await setup.execute();
  });

  const getAdminTasks = async (filter: IAdminTasksFilter) => {
    const { errors, data } = await setup.getApolloClient(filter.secretary).query({
      query: GET_ADMIN_TASKS,
      variables: filter
    });
    expect(errors).toBeUndefined();
    return data!.getAdminTasks;
  };

  const expectToFindAdminTaskWithStatuses = async (
    adminTasks: AdminTask[],
    statuses: ApprovalStatus[],
    secretary: Secretary
  ) => {
    const result = await getAdminTasks({
      adminTaskTypes: adminTasks.map(adminTask => adminTask.constructor.name) as any,
      statuses,
      secretary
    });
    expect(result.results).toEqual(
      expect.arrayContaining(
        adminTasks.map(adminTask =>
          expect.objectContaining({
            uuid: adminTask.uuid
          })
        )
      )
    );
    expect(result.shouldFetchMore).toEqual(false);
  };

  it("returns an empty array if no adminTaskTypes are provided", async () => {
    const result = await getAdminTasks({
      adminTaskTypes: [],
      statuses: [ApprovalStatus.pending],
      secretary: setup.extensionAdmin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns only pending companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.pendingCompany],
      [ApprovalStatus.pending],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only approved companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.approvedCompany],
      [ApprovalStatus.approved],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only rejected companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.rejectedCompany],
      [ApprovalStatus.rejected],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only pending applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.pendingApplicant],
      [ApprovalStatus.pending],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only approved applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.approvedApplicant],
      [ApprovalStatus.approved],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only rejected applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.rejectedApplicant],
      [ApprovalStatus.rejected],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only pending offers", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.pendingOffer],
      [ApprovalStatus.pending],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only approved offers", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.approvedOffer],
      [ApprovalStatus.approved],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only rejected offers", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.rejectedOffer],
      [ApprovalStatus.rejected],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only pending jobApplications by extension secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.pendingByExtensionJobApplication],
      [ApprovalStatus.pending],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only approved jobApplications by extension secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.approvedByExtensionJobApplication],
      [ApprovalStatus.approved],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only rejected jobApplications by extension secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.rejectedByExtensionJobApplication],
      [ApprovalStatus.rejected],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only pending jobApplications by graduados secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.pendingByGraduadosJobApplication],
      [ApprovalStatus.pending],
      setup.graduadosAdmin.secretary
    );
  });

  it("returns only approved jobApplications by graduados secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.approvedByGraduadosJobApplication],
      [ApprovalStatus.approved],
      setup.graduadosAdmin.secretary
    );
  });

  it("returns only rejected jobApplications by graduados secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.rejectedByGraduadosJobApplication],
      [ApprovalStatus.rejected],
      setup.graduadosAdmin.secretary
    );
  });

  it("returns only pending applicants and companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.pendingApplicant, setup.pendingCompany],
      [ApprovalStatus.pending],
      setup.extensionAdmin.secretary
    );
  });

  it("sorts all applicants, companies, offers and JobApplications in any status by updated timestamp", async () => {
    const result = await getAdminTasks({
      adminTaskTypes: [
        AdminTaskType.Applicant,
        AdminTaskType.Company,
        AdminTaskType.Offer,
        AdminTaskType.JobApplication
      ],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: setup.extensionAdmin.secretary
    });
    expect(result.results.map(adminTask => adminTask.uuid)).toEqual(
      setup.allTasksByDescUpdatedAt.map(task => task.uuid)
    );
    expect(result.results).toBeSortedBy({ key: "updatedAt", order: "desc" });
    expect(result.shouldFetchMore).toEqual(false);
  });

  it("limits to itemsPerPage results", async () => {
    const itemsPerPage = 6;
    mockItemsPerPage(itemsPerPage);
    const lastTaskIndex = 27;
    const lastTask = setup.allTasksByDescUpdatedAt[lastTaskIndex];
    const result = await getAdminTasks({
      adminTaskTypes: [
        AdminTaskType.Applicant,
        AdminTaskType.Company,
        AdminTaskType.Offer,
        AdminTaskType.JobApplication
      ],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      updatedBeforeThan: {
        dateTime: lastTask.updatedAt.toISOString(),
        uuid: lastTask.uuid
      },
      secretary: setup.extensionAdmin.secretary
    });
    expect(result.shouldFetchMore).toEqual(false);
    expect(result.results.map(task => task.uuid)).toEqual(
      setup.allTasksByDescUpdatedAt
        .map(task => task.uuid)
        .slice(lastTaskIndex + 1, lastTaskIndex + 1 + itemsPerPage)
    );
  });

  describe("when the variables are incorrect", () => {
    it("returns an error if no filter is provided", async () => {
      const { errors } = await setup.extensionApolloClient.query({
        query: GET_ADMIN_TASKS,
        variables: {}
      });
      expect(errors).not.toBeUndefined();
    });
  });

  describe("only admins can execute this query", () => {
    const testForbiddenAccess = async ({
      apolloClient: client
    }: {
      apolloClient: ApolloServerTestClient;
    }) => {
      const { errors } = await client.query({
        query: GET_ADMIN_TASKS,
        variables: {
          adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.Offer],
          statuses: [ApprovalStatus.pending]
        }
      });
      expect(errors![0].extensions!.data).toEqual({
        errorType: UnauthorizedError.name
      });
    };

    it("throws an error to plain users", async () => {
      await testForbiddenAccess(await TestClientGenerator.user());
    });

    it("throws an error to company users", async () => {
      await testForbiddenAccess(await TestClientGenerator.company());
    });

    it("throws an error to applicants", async () => {
      await testForbiddenAccess(await TestClientGenerator.applicant());
    });
  });
});
