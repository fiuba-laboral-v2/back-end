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
    expect(result.results).toHaveLength(adminTasks.length);
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
      (await setup.allTasksByDescUpdatedAtForSecretary(secretary)).map(task => task.uuid)
    );
    expect(result.results).toBeSortedBy({ key: "updatedAt", order: "desc" });
    expect(result.shouldFetchMore).toEqual(false);
  };

  it("returns an empty array if no statuses are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [AdminTaskType.Applicant],
      statuses: [],
      secretary: setup.admins.extension.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns an empty array if no adminTaskTypes are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [],
      statuses: [ApprovalStatus.pending],
      secretary: setup.admins.extension.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns an empty array if no adminTaskTypes and statuses are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [],
      statuses: [],
      secretary: setup.admins.extension.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns only pending companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.companies.pending],
      [ApprovalStatus.pending],
      setup.admins.extension.secretary
    );
  });

  it("returns only approved companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.companies.approved],
      [ApprovalStatus.approved],
      setup.admins.extension.secretary
    );
  });

  it("returns only rejected companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.companies.rejected],
      [ApprovalStatus.rejected],
      setup.admins.extension.secretary
    );
  });

  it("returns only pending graduates and both for graduadosAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.applicants.pendingStudentAndGraduate, setup.applicants.pendingGraduate],
      [ApprovalStatus.pending],
      setup.admins.graduados.secretary
    );
  });

  it("returns only pending students for extensionAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.applicants.pendingStudent],
      [ApprovalStatus.pending],
      setup.admins.extension.secretary
    );
  });

  it("returns only approved graduates and both for graduadosAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.applicants.approvedStudentAndGraduate, setup.applicants.approvedGraduate],
      [ApprovalStatus.approved],
      setup.admins.graduados.secretary
    );
  });

  it("returns only approved students for extensionAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.applicants.approvedStudent],
      [ApprovalStatus.approved],
      setup.admins.extension.secretary
    );
  });

  it("returns only rejected graduates and both for graduadosAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.applicants.rejectedStudentAndGraduate, setup.applicants.rejectedGraduate],
      [ApprovalStatus.rejected],
      setup.admins.graduados.secretary
    );
  });

  it("returns only rejected students for extensionAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.applicants.rejectedStudent],
      [ApprovalStatus.rejected],
      setup.admins.extension.secretary
    );
  });

  it("returns only pending offers targeted for students", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.offers.pendingForStudents, setup.offers.pendingForBoth],
      [ApprovalStatus.pending],
      setup.admins.extension.secretary
    );
  });

  it("returns only pending offers targeted for graduates", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.offers.pendingForGraduates, setup.offers.pendingForBoth],
      [ApprovalStatus.pending],
      setup.admins.graduados.secretary
    );
  });

  it("returns only approved offers targeted for students", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.offers.approvedForStudents, setup.offers.approvedForBoth],
      [ApprovalStatus.approved],
      setup.admins.extension.secretary
    );
  });

  it("returns only approved offers targeted for graduates", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.offers.approvedForGraduates, setup.offers.approvedForBoth],
      [ApprovalStatus.approved],
      setup.admins.graduados.secretary
    );
  });

  it("returns only rejected offers targeted for students", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.offers.rejectedForStudents, setup.offers.rejectedForBoth],
      [ApprovalStatus.rejected],
      setup.admins.extension.secretary
    );
  });

  it("returns only rejected offers targeted for graduates", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.offers.rejectedForGraduates, setup.offers.rejectedForBoth],
      [ApprovalStatus.rejected],
      setup.admins.graduados.secretary
    );
  });

  it("returns only pending jobApplications visible by extensionAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.jobApplications.pendingByExtension],
      [ApprovalStatus.pending],
      setup.admins.extension.secretary
    );
  });

  it("returns only approved jobApplications visible by extensionAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.jobApplications.approvedByExtension],
      [ApprovalStatus.approved],
      setup.admins.extension.secretary
    );
  });

  it("returns only rejected jobApplications visible by extensionAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.jobApplications.rejectedByExtension],
      [ApprovalStatus.rejected],
      setup.admins.extension.secretary
    );
  });

  it("returns only pending jobApplications visible by graduadosAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.jobApplications.pendingByGraduados],
      [ApprovalStatus.pending],
      setup.admins.graduados.secretary
    );
  });

  it("returns only approved jobApplications visible by graduadosAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.jobApplications.approvedByGraduados],
      [ApprovalStatus.approved],
      setup.admins.graduados.secretary
    );
  });

  it("returns only rejected jobApplications visible by graduadosAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [setup.jobApplications.rejectedByGraduados],
      [ApprovalStatus.rejected],
      setup.admins.graduados.secretary
    );
  });

  it("returns only pending graduates, studentsAndGraduates, companies and Offers", async () => {
    await expectToFindAdminTasksWithStatuses(
      [
        setup.companies.pending,
        setup.applicants.pendingStudentAndGraduate,
        setup.applicants.pendingGraduate,
        setup.offers.pendingForGraduates,
        setup.offers.pendingForBoth
      ],
      [ApprovalStatus.pending],
      setup.admins.graduados.secretary
    );
  });

  it("returns only pending students companies and Offers for students and both for extensionAdmin", async () => {
    await expectToFindAdminTasksWithStatuses(
      [
        setup.companies.pending,
        setup.applicants.pendingStudent,
        setup.offers.pendingForStudents,
        setup.offers.pendingForBoth
      ],
      [ApprovalStatus.pending],
      setup.admins.extension.secretary
    );
  });

  it("returns approved and rejected graduates and both, companies and Offers for graduates and both", async () => {
    await expectToFindAdminTasksWithStatuses(
      [
        setup.companies.approved,
        setup.companies.rejected,
        setup.applicants.approvedStudentAndGraduate,
        setup.applicants.rejectedStudentAndGraduate,
        setup.applicants.approvedGraduate,
        setup.applicants.rejectedGraduate,
        setup.offers.approvedForGraduates,
        setup.offers.rejectedForGraduates,
        setup.offers.approvedForBoth,
        setup.offers.rejectedForBoth
      ],
      [ApprovalStatus.approved, ApprovalStatus.rejected],
      setup.admins.graduados.secretary
    );
  });

  it("returns approved and rejected students, companies and Offers for students and both", async () => {
    await expectToFindAdminTasksWithStatuses(
      [
        setup.companies.approved,
        setup.companies.rejected,
        setup.applicants.approvedStudent,
        setup.applicants.rejectedStudent,
        setup.offers.approvedForStudents,
        setup.offers.rejectedForStudents,
        setup.offers.approvedForBoth,
        setup.offers.rejectedForBoth
      ],
      [ApprovalStatus.approved, ApprovalStatus.rejected],
      setup.admins.extension.secretary
    );
  });

  it("sorts all tasks by updatedAt in any status for extension secretary", async () => {
    await expectToSortAllTasksFor(setup.admins.extension.secretary);
  });

  it("sorts all tasks by updatedAt in any status for graduados secretary", async () => {
    await expectToSortAllTasksFor(setup.admins.graduados.secretary);
  });

  it("limits to itemsPerPage results", async () => {
    const { secretary } = setup.admins.extension;
    const itemsPerPage = 3;
    mockItemsPerPage(itemsPerPage);
    const lastTaskIndex = 1;
    const lastTask = (await setup.allTasksByDescUpdatedAtForSecretary(secretary))[lastTaskIndex];
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
      secretary
    });
    expect(result.shouldFetchMore).toEqual(true);
    expect(result.results.map(task => task.uuid)).toEqual(
      (await setup.allTasksByDescUpdatedAtForSecretary(setup.admins.extension.secretary))
        .map(task => task.uuid)
        .slice(lastTaskIndex + 1, lastTaskIndex + 1 + itemsPerPage)
    );
  });

  describe("when there are tasks with equal updatedAt", () => {
    let firstTask: AdminTask;
    const companies: Company[] = [];

    beforeAll(async () => {
      firstTask = setup.tasks[setup.tasks.length - 1];
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
        secretary: setup.admins.extension.secretary
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
