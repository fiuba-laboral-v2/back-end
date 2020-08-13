import { gql } from "apollo-server";
import { ApolloServerTestClient } from "apollo-server-testing";

import { CompanyRepository } from "$models/Company";
import { AdminTask, AdminTaskType, IAdminTasksFilter } from "$models/AdminTask";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UserRepository } from "$models/User";
import { Admin, Applicant, Company } from "$models";
import { UnauthorizedError } from "$graphql/Errors";

import { AdminGenerator } from "$generators/Admin";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { TestClientGenerator } from "$generators/TestClient";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { Secretary } from "$models/Admin";

const GET_ADMIN_TASKS = gql`
  query GetAdminTasks(
    $adminTaskTypes: [AdminTaskType]!,
    $statuses: [ApprovalStatus]!,
    $updatedBeforeThan: DateTime
  ) {
    getAdminTasks(
      adminTaskTypes: $adminTaskTypes,
      statuses: $statuses,
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
      }
      shouldFetchMore
    }
  }
`;

describe("getAdminTasks", () => {
  let admin: Admin;
  let approvedCompany: Company;
  let rejectedCompany: Company;
  let pendingCompany: Company;
  let approvedApplicant: Applicant;
  let rejectedApplicant: Applicant;
  let pendingApplicant: Applicant;
  let allTasksByDescUpdatedAt: AdminTask[];

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    const companiesGenerator = CompanyGenerator.instance.updatedWithStatus;
    admin = await AdminGenerator.instance(Secretary.extension);
    const applicantsGenerator = ApplicantGenerator.instance.updatedWithStatus;
    rejectedCompany = await companiesGenerator({ status: ApprovalStatus.rejected, admin });
    approvedCompany = await companiesGenerator({ status: ApprovalStatus.approved, admin });
    pendingCompany = await companiesGenerator();
    rejectedApplicant = await applicantsGenerator({ status: ApprovalStatus.rejected, admin });
    approvedApplicant = await applicantsGenerator({ status: ApprovalStatus.approved, admin });
    pendingApplicant = await applicantsGenerator();

    allTasksByDescUpdatedAt = [
      rejectedCompany,
      approvedCompany,
      pendingCompany,
      rejectedApplicant,
      approvedApplicant,
      pendingApplicant
    ].sort(task => -task.updatedAt);
  });

  const getAdminTasks = async (filter: IAdminTasksFilter) => {
    const { apolloClient } = await TestClientGenerator.admin();
    const { errors, data } = await apolloClient.query({
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
    expect(result.results).toEqual(expect.arrayContaining(
      adminTasks.map(adminTask => expect.objectContaining({
        uuid: adminTask.uuid
      }))
    ));
    expect(result.shouldFetchMore).toEqual(false);
  };

  it("returns an empty array if no adminTaskTypes are provided", async () => {
    const result = await getAdminTasks({
      adminTaskTypes: [],
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.graduados
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns only pending companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [pendingCompany],
      [ApprovalStatus.pending],
      Secretary.graduados
    );
  });

  it("returns only approved companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [approvedCompany],
      [ApprovalStatus.approved],
      Secretary.graduados
    );
  });

  it("returns only rejected companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [rejectedCompany],
      [ApprovalStatus.rejected],
      Secretary.graduados
    );
  });

  it("returns only pending applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [pendingApplicant],
      [ApprovalStatus.pending],
      Secretary.graduados
    );
  });

  it("returns only approved applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [approvedApplicant],
      [ApprovalStatus.approved],
      Secretary.graduados
    );
  });

  it("returns only rejected applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [rejectedApplicant],
      [ApprovalStatus.rejected],
      Secretary.graduados
    );
  });

  it("returns only pending applicants and companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [pendingApplicant, pendingCompany],
      [ApprovalStatus.pending],
      Secretary.graduados
    );
  });

  it("sorts all applicants and companies in any status by updated timestamp", async () => {
    const result = await getAdminTasks({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados
    });
    expect(result.results.map(adminTask => adminTask.uuid)).toEqual([
      pendingApplicant.uuid,
      approvedApplicant.uuid,
      rejectedApplicant.uuid,
      pendingCompany.uuid,
      approvedCompany.uuid,
      rejectedCompany.uuid
    ]);
    expect(result.results).toBeSortedBy({ key: "updatedAt", order: "desc" });
    expect(result.shouldFetchMore).toEqual(false);
  });

  it("limits to itemsPerPage results", async () => {
    const itemsPerPage = 6;
    mockItemsPerPage(itemsPerPage);
    const lastTaskIndex = 3;
    const result = await getAdminTasks({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      updatedBeforeThan: allTasksByDescUpdatedAt[lastTaskIndex].updatedAt.toISOString(),
      secretary: Secretary.graduados
    });
    expect(result.shouldFetchMore).toEqual(false);
    expect(
      result.results
        .map(task => task.uuid)
    ).toEqual(
      allTasksByDescUpdatedAt
        .map(task => task.uuid)
        .slice(lastTaskIndex + 1, lastTaskIndex + 1 + itemsPerPage)
    );
  });

  describe("when the variables are incorrect", () => {
    it("returns an error if no filter is provided", async () => {
      const { apolloClient } = await TestClientGenerator.admin();
      const { errors } = await apolloClient.query({
        query: GET_ADMIN_TASKS,
        variables: {}
      });
      expect(errors).not.toBeUndefined();
    });
  });

  describe("only admins can execute this query", () => {
    const testForbiddenAccess = async (
      { apolloClient }: { apolloClient: ApolloServerTestClient }
    ) => {
      const { errors } = await apolloClient.query({
        query: GET_ADMIN_TASKS,
        variables: {
          adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company],
          statuses: [ApprovalStatus.pending]
        }
      });
      expect(errors![0].extensions!.data).toEqual({ errorType: UnauthorizedError.name });
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
