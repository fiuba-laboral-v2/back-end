import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { AdminTask, AdminTaskRepository, AdminTaskType } from "$models/AdminTask";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin, Applicant, Company } from "$models";

import { AdminGenerator } from "$generators/Admin";
import { ApplicantGenerator } from "$generators/Applicant";
import { CompanyGenerator } from "$generators/Company";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { Secretary } from "$models/Admin";

describe("AdminTaskRepository", () => {
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

  const expectToFindAdminTasksWithStatuses = async (
    adminTasks: AdminTask[],
    statuses: ApprovalStatus[],
    secretary: Secretary
  ) => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: adminTasks.map(adminTask => adminTask.constructor.name) as any,
      statuses,
      secretary
    });
    expect(result.results).toEqual(expect.arrayContaining(
      adminTasks.map(adminTask => expect.objectContaining(adminTask.toJSON()))
    ));
    expect(result.shouldFetchMore).toEqual(false);
  };

  it("returns an empty array if no statuses are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [AdminTaskType.Applicant],
      statuses: [],
      secretary: admin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns an empty array if no adminTaskTypes are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [],
      statuses: [ApprovalStatus.pending],
      secretary: admin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns an empty array if no adminTaskTypes and statuses are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [],
      statuses: [],
      secretary: admin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns only pending companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [pendingCompany],
      [ApprovalStatus.pending],
      admin.secretary
    );
  });

  it("returns only approved companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [approvedCompany],
      [ApprovalStatus.approved],
      admin.secretary
    );
  });

  it("returns only rejected companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [rejectedCompany],
      [ApprovalStatus.rejected],
      admin.secretary
    );
  });

  it("returns only pending applicants", async () => {
    await expectToFindAdminTasksWithStatuses(
      [pendingApplicant],
      [ApprovalStatus.pending],
      admin.secretary
    );
  });

  it("returns only approved applicants", async () => {
    await expectToFindAdminTasksWithStatuses(
      [approvedApplicant],
      [ApprovalStatus.approved],
      admin.secretary
    );
  });

  it("returns only rejected applicants", async () => {
    await expectToFindAdminTasksWithStatuses(
      [rejectedApplicant],
      [ApprovalStatus.rejected],
      admin.secretary
    );
  });

  it("returns only pending applicants and companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [pendingCompany, pendingApplicant],
      [ApprovalStatus.pending],
      admin.secretary
    );
  });

  it("returns only approved and rejected applicants and companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [approvedCompany, rejectedCompany, approvedApplicant, rejectedApplicant],
      [ApprovalStatus.approved, ApprovalStatus.rejected],
      admin.secretary
    );
  });

  it("sorts pending applicants and companies by updatedAt in any status", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: admin.secretary
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
    const itemsPerPage = 3;
    mockItemsPerPage(itemsPerPage);
    const lastTaskIndex = 1;
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      updatedBeforeThan: allTasksByDescUpdatedAt[lastTaskIndex].updatedAt,
      secretary: admin.secretary
    });
    expect(result.shouldFetchMore).toEqual(true);
    expect(
      result.results
        .map(task => task.uuid)
    ).toEqual(
      allTasksByDescUpdatedAt
        .map(task => task.uuid)
        .slice(lastTaskIndex + 1, lastTaskIndex + 1 + itemsPerPage)
    );
  });
});
