import { gql } from "apollo-server";
import { ApolloServerTestClient } from "apollo-server-testing";

import { CompanyRepository } from "$models/Company";
import { AdminTask, AdminTaskType, IAdminTasksFilter } from "$models/AdminTask";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { UserRepository } from "$models/User";
import { Admin, Applicant, Company, Offer } from "$models";
import { UnauthorizedError } from "$graphql/Errors";

import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { TestClientGenerator } from "$generators/TestClient";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { Secretary } from "$models/Admin";
import { OfferGenerator } from "$test/generators/Offer";
import { OfferRepository } from "$models/Offer";

const GET_ADMIN_TASKS = gql`
  query GetAdminTasks(
    $adminTaskTypes: [AdminTaskType]!,
    $statuses: [ApprovalStatus]!,
    $updatedBeforeThan: PaginatedInput
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
        ... on Offer {
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
  let apolloClient;
  let approvedCompany: Company;
  let rejectedCompany: Company;
  let pendingCompany: Company;
  let approvedApplicant: Applicant;
  let rejectedApplicant: Applicant;
  let pendingApplicant: Applicant;
  let approvedOffer: Offer;
  let rejectedOffer: Offer;
  let pendingOffer: Offer;
  let allTasksByDescUpdatedAt: AdminTask[];

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await OfferRepository.truncate();
    const generator = await TestClientGenerator.admin();
    admin = generator.admin;
    apolloClient = generator.apolloClient;
    const companiesGenerator = CompanyGenerator.instance.updatedWithStatus;
    const applicantsGenerator = ApplicantGenerator.instance.updatedWithStatus;
    rejectedCompany = await companiesGenerator({ status: ApprovalStatus.rejected, admin });
    approvedCompany = await companiesGenerator({ status: ApprovalStatus.approved, admin });
    pendingCompany = await companiesGenerator();
    rejectedApplicant = await applicantsGenerator({ status: ApprovalStatus.rejected, admin });
    approvedApplicant = await applicantsGenerator({ status: ApprovalStatus.approved, admin });
    pendingApplicant = await applicantsGenerator();
    const offers = await OfferGenerator.instance.updatedWithStatus();
    const secretary = admin.secretary;
    rejectedOffer = await offers.next(
      { companyUuid: approvedCompany.uuid, secretary, status: ApprovalStatus.rejected }
    ).value;
    approvedOffer = await offers.next(
      { companyUuid: approvedCompany.uuid, secretary, status: ApprovalStatus.approved }
    ).value;
    pendingOffer = await offers.next(
      { companyUuid: approvedCompany.uuid, secretary, status: ApprovalStatus.pending }
    ).value;

    allTasksByDescUpdatedAt = [
      rejectedCompany,
      approvedCompany,
      pendingCompany,
      rejectedApplicant,
      approvedApplicant,
      pendingApplicant,
      rejectedOffer,
      approvedOffer,
      pendingOffer
    ].sort(task => -task.updatedAt);
  });

  const getAdminTasks = async (filter: IAdminTasksFilter) => {
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
      secretary: admin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns only pending companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [pendingCompany],
      [ApprovalStatus.pending],
      admin.secretary
    );
  });

  it("returns only approved companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [approvedCompany],
      [ApprovalStatus.approved],
      admin.secretary
    );
  });

  it("returns only rejected companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [rejectedCompany],
      [ApprovalStatus.rejected],
      admin.secretary
    );
  });

  it("returns only pending applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [pendingApplicant],
      [ApprovalStatus.pending],
      admin.secretary
    );
  });

  it("returns only approved applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [approvedApplicant],
      [ApprovalStatus.approved],
      admin.secretary
    );
  });

  it("returns only rejected applicants", async () => {
    await expectToFindAdminTaskWithStatuses(
      [rejectedApplicant],
      [ApprovalStatus.rejected],
      admin.secretary
    );
  });

  it("returns only pending offers", async () => {
    await expectToFindAdminTaskWithStatuses(
      [pendingOffer],
      [ApprovalStatus.pending],
      admin.secretary
    );
  });

  it("returns only approved offers", async () => {
    await expectToFindAdminTaskWithStatuses(
      [approvedOffer],
      [ApprovalStatus.approved],
      admin.secretary
    );
  });

  it("returns only rejected offers", async () => {
    await expectToFindAdminTaskWithStatuses(
      [rejectedOffer],
      [ApprovalStatus.rejected],
      admin.secretary
    );
  });

  it("returns only pending applicants and companies", async () => {
    await expectToFindAdminTaskWithStatuses(
      [pendingApplicant, pendingCompany],
      [ApprovalStatus.pending],
      admin.secretary
    );
  });

  it("sorts all applicants, companies and offer in any status by updated timestamp", async () => {
    const result = await getAdminTasks({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.Offer],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: admin.secretary
    });
    expect(result.results.map(adminTask => adminTask.uuid)).toEqual([
      pendingOffer.uuid,
      approvedOffer.uuid,
      rejectedOffer.uuid,
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
    const lastTask = allTasksByDescUpdatedAt[lastTaskIndex];
    const result = await getAdminTasks({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.Offer],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      updatedBeforeThan: {
        dateTime: lastTask.updatedAt.toISOString(),
        uuid: lastTask.uuid
      },
      secretary: admin.secretary
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
      const { errors } = await apolloClient.query({
        query: GET_ADMIN_TASKS,
        variables: {}
      });
      expect(errors).not.toBeUndefined();
    });
  });

  describe("only admins can execute this query", () => {
    const testForbiddenAccess = async (
      { apolloClient: client }: { apolloClient: ApolloServerTestClient }
    ) => {
      const { errors } = await client.query({
        query: GET_ADMIN_TASKS,
        variables: {
          adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.Offer],
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
