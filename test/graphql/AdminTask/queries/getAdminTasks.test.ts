import { gql } from "apollo-server";
import { ApolloServerTestClient } from "apollo-server-testing";

import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
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
    await CareerRepository.truncate();
    setup = new AdminTaskTestSetup({ graphqlSetup: true });
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
      secretary: setup.admins.extension.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns only pending companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.companies.pending],
      [ApprovalStatus.pending],
      setup.admins.extension.secretary
    );
  });

  it("returns only approved companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.companies.approved],
      [ApprovalStatus.approved],
      setup.admins.extension.secretary
    );
  });

  it("returns only rejected companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.companies.rejected],
      [ApprovalStatus.rejected],
      setup.admins.extension.secretary
    );
  });

  it("returns only pending applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.applicants.pendingStudentAndGraduate],
      [ApprovalStatus.pending],
      setup.admins.graduados.secretary
    );
  });

  it("returns only approved applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.applicants.approvedStudentAndGraduate],
      [ApprovalStatus.approved],
      setup.admins.graduados.secretary
    );
  });

  it("returns only rejected applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.applicants.rejectedStudentAndGraduate],
      [ApprovalStatus.rejected],
      setup.admins.graduados.secretary
    );
  });

  it("returns only pending offers targeted for students", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.offers.pendingOfferForStudents, setup.offers.pendingOfferForBoth],
      [ApprovalStatus.pending],
      setup.admins.extension.secretary
    );
  });

  it("returns only pending offers targeted for graduates", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.offers.pendingOfferForGraduates, setup.offers.pendingOfferForBoth],
      [ApprovalStatus.pending],
      setup.admins.graduados.secretary
    );
  });

  it("returns only approved offers targeted for students", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.offers.approvedOfferForStudents, setup.offers.approvedOfferForBoth],
      [ApprovalStatus.approved],
      setup.admins.extension.secretary
    );
  });

  it("returns only approved offers targeted for graduates", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.offers.approvedOfferForGraduates, setup.offers.approvedOfferForBoth],
      [ApprovalStatus.approved],
      setup.admins.graduados.secretary
    );
  });

  it("returns only rejected offers targeted for students", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.offers.rejectedOfferForStudents, setup.offers.rejectedOfferForBoth],
      [ApprovalStatus.rejected],
      setup.admins.extension.secretary
    );
  });

  it("returns only rejected offers targeted for graduates", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.offers.rejectedOfferForGraduates, setup.offers.rejectedOfferForBoth],
      [ApprovalStatus.rejected],
      setup.admins.graduados.secretary
    );
  });

  it("returns jobApplications in pending status by extension secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.jobApplications.pendingByExtension],
      [ApprovalStatus.pending],
      setup.admins.extension.secretary
    );
  });

  it("returns jobApplications approved by extension secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.jobApplications.approvedByExtension],
      [ApprovalStatus.approved],
      setup.admins.extension.secretary
    );
  });

  it("returns jobApplications rejected by extension secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.jobApplications.rejectedByExtension],
      [ApprovalStatus.rejected],
      setup.admins.extension.secretary
    );
  });

  it("returns jobApplications in pending status by graduados secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.jobApplications.pendingByGraduados],
      [ApprovalStatus.pending],
      setup.admins.graduados.secretary
    );
  });

  it("returns jobApplications approved by graduados secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.jobApplications.approvedByGraduados],
      [ApprovalStatus.approved],
      setup.admins.graduados.secretary
    );
  });

  it("returns jobApplications rejected by graduados secretary", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.jobApplications.rejectedByGraduados],
      [ApprovalStatus.rejected],
      setup.admins.graduados.secretary
    );
  });

  it("returns only pending applicants and companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [setup.applicants.pendingStudentAndGraduate, setup.companies.pending],
      [ApprovalStatus.pending],
      setup.admins.graduados.secretary
    );
  });

  it("sorts all applicants, companies, offers and JobApplications in any status by updated timestamp", async () => {
    const { secretary } = setup.admins.extension;
    const result = await getAdminTasks({
      adminTaskTypes: [
        AdminTaskType.Applicant,
        AdminTaskType.Company,
        AdminTaskType.Offer,
        AdminTaskType.JobApplication
      ],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary
    });
    expect(result.results.map(adminTask => adminTask.uuid)).toEqual(
      (await setup.allTasksByDescUpdatedAtForSecretary(secretary)).map(task => task.uuid)
    );
    expect(result.results).toBeSortedBy({ key: "updatedAt", order: "desc" });
    expect(result.shouldFetchMore).toEqual(false);
  });

  it("limits to itemsPerPage results", async () => {
    const { secretary } = setup.admins.extension;
    const allTasksByDescUpdatedAt = await setup.allTasksByDescUpdatedAtForSecretary(secretary);
    const itemsPerPage = 6;
    mockItemsPerPage(itemsPerPage);
    const lastTaskIndex = allTasksByDescUpdatedAt.length - 1;
    const lastTask = allTasksByDescUpdatedAt[lastTaskIndex];
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
      secretary
    });
    expect(result.shouldFetchMore).toEqual(false);
    expect(result.results.map(task => task.uuid)).toEqual(
      allTasksByDescUpdatedAt
        .map(task => task.uuid)
        .slice(lastTaskIndex + 1, lastTaskIndex + 1 + itemsPerPage)
    );
  });

  describe("when the variables are incorrect", () => {
    it("returns an error if no filter is provided", async () => {
      const { errors } = await setup.admins.extensionApolloClient.query({
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
