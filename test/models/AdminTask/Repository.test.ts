import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";
import { AdminTask, AdminTaskRepository, AdminTaskType } from "$models/AdminTask";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Company } from "$models";

import { AdminTaskTestSetup } from "$setup/AdminTask";
import { CompanyGenerator } from "$generators/Company";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { Secretary } from "$models/Admin";
import MockDate from "mockdate";
import { range, uniq } from "lodash";
import { OfferRepository } from "$models/Offer";

describe("AdminTaskRepository", () => {
  let setup: AdminTaskTestSetup;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await OfferRepository.truncate();
    await CareerRepository.truncate();
    setup = new AdminTaskTestSetup({ graphqlSetup: false });
    await setup.execute();
  });

  const findAdminTasks = (
    adminTasks: AdminTask[],
    statuses: ApprovalStatus[],
    secretary: Secretary
  ) =>
    AdminTaskRepository.find({
      adminTaskTypes: uniq(adminTasks.map(adminTask => adminTask.constructor.name)) as any,
      statuses,
      secretary
    });

  const expectToFindAdminTasksWithStatuses = async (
    adminTasks: AdminTask[],
    statuses: ApprovalStatus[],
    secretary: Secretary
  ) => {
    const result = await findAdminTasks(adminTasks, statuses, secretary);
    expect(result.results).toEqual(
      expect.arrayContaining(
        adminTasks.map(adminTask => expect.objectContaining(adminTask.toJSON()))
      )
    );
    expect(result.shouldFetchMore).toEqual(false);
  };

  const expectToSortAllTasksFor = async (secretary: Secretary) => {
    const result = await AdminTaskRepository.find({
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
      setup.allTasksByDescUpdatedAtForSecretary(secretary).map(task => task.uuid)
    );
    expect(result.results).toBeSortedBy({ key: "updatedAt", order: "desc" });
    expect(result.shouldFetchMore).toEqual(false);
  };

  it("returns an empty array if no statuses are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [AdminTaskType.Applicant],
      statuses: [],
      secretary: setup.extensionAdmin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns an empty array if no adminTaskTypes are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [],
      statuses: [ApprovalStatus.pending],
      secretary: setup.extensionAdmin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns an empty array if no adminTaskTypes and statuses are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [],
      statuses: [],
      secretary: setup.extensionAdmin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns only pending companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.pendingCompany],
      [ApprovalStatus.pending],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only approved companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.approvedCompany],
      [ApprovalStatus.approved],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only rejected companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.rejectedCompany],
      [ApprovalStatus.rejected],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only pending applicants", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.pendingApplicant],
      [ApprovalStatus.pending],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only approved applicants", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.approvedApplicant],
      [ApprovalStatus.approved],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only rejected applicants", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.rejectedApplicant],
      [ApprovalStatus.rejected],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only pending offers targeted for students", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.pendingOfferForStudents, setup.pendingOfferForBoth],
      [ApprovalStatus.pending],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only pending offers targeted for graduates", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.pendingOfferForGraduates, setup.pendingOfferForBoth],
      [ApprovalStatus.pending],
      setup.graduadosAdmin.secretary
    );
  });

  it("returns only approved offers targeted for students", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.approvedOfferForStudents, setup.approvedOfferForBoth],
      [ApprovalStatus.approved],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only approved offers targeted for graduates", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.approvedOfferForGraduates, setup.approvedOfferForBoth],
      [ApprovalStatus.approved],
      setup.graduadosAdmin.secretary
    );
  });

  it("returns only rejected offers targeted for students", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.rejectedOfferForStudents, setup.rejectedOfferForBoth],
      [ApprovalStatus.rejected],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only rejected offers targeted for graduates", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.rejectedOfferForGraduates, setup.rejectedOfferForBoth],
      [ApprovalStatus.rejected],
      setup.graduadosAdmin.secretary
    );
  });

  it("returns only pending by extension secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.pendingByExtensionJobApplication],
      [ApprovalStatus.pending],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only approved by extension secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.approvedByExtensionJobApplication],
      [ApprovalStatus.approved],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only rejected by extension secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.rejectedByExtensionJobApplication],
      [ApprovalStatus.rejected],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only pending by graduados secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.pendingByGraduadosJobApplication],
      [ApprovalStatus.pending],
      setup.graduadosAdmin.secretary
    );
  });

  it("returns only approved by graduados secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.approvedByGraduadosJobApplication],
      [ApprovalStatus.approved],
      setup.graduadosAdmin.secretary
    );
  });

  it("returns only rejected by graduados secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.rejectedByGraduadosJobApplication],
      [ApprovalStatus.rejected],
      setup.graduadosAdmin.secretary
    );
  });

  it("returns only pending applicants, companies and Offers", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.pendingCompany, setup.pendingApplicant, setup.pendingOfferForStudents],
      [ApprovalStatus.pending],
      setup.extensionAdmin.secretary
    );
  });

  it("returns only approved and rejected applicants, companies and Offers", async () => {
    await expectToFindAdminTasksWithStatuses(
      [
        setup.approvedCompany,
        setup.rejectedCompany,
        setup.approvedApplicant,
        setup.rejectedApplicant,
        setup.approvedOfferForStudents,
        setup.rejectedOfferForStudents
      ],
      [ApprovalStatus.approved, ApprovalStatus.rejected],
      setup.extensionAdmin.secretary
    );
  });

  it("sorts all tasks by updatedAt in any status for extension secretary", async () => {
    await expectToSortAllTasksFor(setup.extensionAdmin.secretary);
  });

  it("sorts all tasks by updatedAt in any status for graduados secretary", async () => {
    await expectToSortAllTasksFor(setup.graduadosAdmin.secretary);
  });

  it("limits to itemsPerPage results", async () => {
    const itemsPerPage = 3;
    mockItemsPerPage(itemsPerPage);
    const lastTaskIndex = 1;
    const lastTask = setup.allTasksByDescUpdatedAt[lastTaskIndex];
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [
        AdminTaskType.Applicant,
        AdminTaskType.Company,
        AdminTaskType.Offer,
        AdminTaskType.JobApplication
      ],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      updatedBeforeThan: {
        dateTime: lastTask.updatedAt,
        uuid: lastTask.uuid
      },
      secretary: setup.extensionAdmin.secretary
    });
    expect(result.shouldFetchMore).toEqual(true);
    expect(result.results.map(task => task.uuid)).toEqual(
      setup.allTasksByDescUpdatedAt
        .map(task => task.uuid)
        .slice(lastTaskIndex + 1, lastTaskIndex + 1 + itemsPerPage)
    );
  });

  describe("when there are tasks with equal updatedAt", () => {
    let firstTask: AdminTask;
    const companies: Company[] = [];

    beforeAll(async () => {
      firstTask = setup.allTasksByDescUpdatedAt[setup.allTasksByDescUpdatedAt.length - 1];
      MockDate.set(firstTask.updatedAt - 1);
      for (const _ of range(9)) {
        companies.push(await CompanyGenerator.instance.updatedWithStatus());
      }
      MockDate.reset();
    });

    it("sorts by uuid", async () => {
      const result = await AdminTaskRepository.find({
        adminTaskTypes: [AdminTaskType.Company],
        statuses: [ApprovalStatus.pending],
        updatedBeforeThan: {
          dateTime: firstTask.updatedAt,
          uuid: firstTask.uuid
        },
        secretary: setup.extensionAdmin.secretary
      });
      expect(result.shouldFetchMore).toEqual(false);
      expect(result.results.map(task => task.uuid)).toEqual(
        companies
          .map(company => company.uuid)
          .sort()
          .reverse()
      );
    });
  });
});
