import { CompanyRepository } from "$models/Company";
import { UserRepository } from "$models/User";
import { AdminTask, AdminTaskRepository, AdminTaskType } from "$models/AdminTask";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Admin, Applicant, Company, JobApplication, Offer } from "$models";

import { AdminGenerator } from "$generators/Admin";
import { ApplicantGenerator } from "$generators/Applicant";
import { CompanyGenerator } from "$generators/Company";
import { OfferGenerator } from "$test/generators/Offer";
import { JobApplicationGenerator } from "$test/generators/JobApplication";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";
import { Secretary } from "$models/Admin";
import MockDate from "mockdate";
import { range } from "lodash";
import { OfferRepository } from "$models/Offer";

describe("AdminTaskRepository", () => {
  let extensionAdmin: Admin;
  let graduadosAdmin: Admin;
  let approvedCompany: Company;
  let rejectedCompany: Company;
  let pendingCompany: Company;
  let approvedApplicant: Applicant;
  let rejectedApplicant: Applicant;
  let pendingApplicant: Applicant;
  let approvedOffer: Offer;
  let rejectedOffer: Offer;
  let pendingOffer: Offer;
  let approvedByExtensionJobApplication: JobApplication;
  let rejectedByExtensionJobApplication: JobApplication;
  let pendingByExtensionJobApplication: JobApplication;
  let approvedByGraduadosJobApplication: JobApplication;
  let rejectedByGraduadosJobApplication: JobApplication;
  let pendingByGraduadosJobApplication: JobApplication;
  let allTasksByDescUpdatedAt: AdminTask[];

  const getJobApplicationAssociations = async (jobApplication: JobApplication) => {
    const applicant = await jobApplication.getApplicant();
    const offer = await jobApplication.getOffer();
    const company = await offer.getCompany();
    return [applicant, company, offer, jobApplication];
  };

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await OfferRepository.truncate();
    extensionAdmin = await AdminGenerator.instance({ secretary: Secretary.extension });
    graduadosAdmin = await AdminGenerator.instance({ secretary: Secretary.graduados });

    rejectedCompany = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.rejected,
      admin: extensionAdmin
    });

    approvedCompany = await CompanyGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.approved,
      admin: extensionAdmin
    });

    pendingCompany = await CompanyGenerator.instance.updatedWithStatus();

    rejectedApplicant = await ApplicantGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.rejected,
      admin: extensionAdmin
    });

    approvedApplicant = await ApplicantGenerator.instance.updatedWithStatus({
      status: ApprovalStatus.approved,
      admin: extensionAdmin
    });

    pendingApplicant = await ApplicantGenerator.instance.updatedWithStatus();

    const secretary = extensionAdmin.secretary;

    rejectedOffer = await OfferGenerator.instance.updatedWithStatus({
      admin: extensionAdmin,
      companyUuid: approvedCompany.uuid,
      secretary,
      status: ApprovalStatus.rejected
    });

    approvedOffer = await OfferGenerator.instance.updatedWithStatus({
      admin: extensionAdmin,
      companyUuid: approvedCompany.uuid,
      secretary,
      status: ApprovalStatus.approved
    });

    pendingOffer = await OfferGenerator.instance.updatedWithStatus({
      admin: extensionAdmin,
      companyUuid: approvedCompany.uuid,
      secretary,
      status: ApprovalStatus.pending
    });

    pendingByExtensionJobApplication = await JobApplicationGenerator.instance.updatedWithStatus({
      admin: extensionAdmin,
      status: ApprovalStatus.pending
    });

    approvedByExtensionJobApplication = await JobApplicationGenerator.instance.updatedWithStatus({
      admin: extensionAdmin,
      status: ApprovalStatus.approved
    });

    rejectedByExtensionJobApplication = await JobApplicationGenerator.instance.updatedWithStatus({
      admin: extensionAdmin,
      status: ApprovalStatus.rejected
    });

    pendingByGraduadosJobApplication = await JobApplicationGenerator.instance.updatedWithStatus({
      admin: graduadosAdmin,
      status: ApprovalStatus.pending
    });

    approvedByGraduadosJobApplication = await JobApplicationGenerator.instance.updatedWithStatus({
      admin: graduadosAdmin,
      status: ApprovalStatus.approved
    });

    rejectedByGraduadosJobApplication = await JobApplicationGenerator.instance.updatedWithStatus({
      admin: graduadosAdmin,
      status: ApprovalStatus.rejected
    });

    allTasksByDescUpdatedAt = [
      rejectedCompany,
      approvedCompany,
      pendingCompany,
      rejectedApplicant,
      approvedApplicant,
      pendingApplicant,
      rejectedOffer,
      approvedOffer,
      pendingOffer,
      ...(await getJobApplicationAssociations(pendingByExtensionJobApplication)),
      ...(await getJobApplicationAssociations(approvedByExtensionJobApplication)),
      ...(await getJobApplicationAssociations(rejectedByExtensionJobApplication)),
      ...(await getJobApplicationAssociations(pendingByGraduadosJobApplication)),
      ...(await getJobApplicationAssociations(approvedByGraduadosJobApplication)),
      ...(await getJobApplicationAssociations(rejectedByGraduadosJobApplication))
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
    expect(result.results).toEqual(
      expect.arrayContaining(
        adminTasks.map(adminTask => expect.objectContaining(adminTask.toJSON()))
      )
    );
    expect(result.shouldFetchMore).toEqual(false);
  };

  it("returns an empty array if no statuses are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [AdminTaskType.Applicant],
      statuses: [],
      secretary: extensionAdmin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns an empty array if no adminTaskTypes are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [],
      statuses: [ApprovalStatus.pending],
      secretary: extensionAdmin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns an empty array if no adminTaskTypes and statuses are provided", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [],
      statuses: [],
      secretary: extensionAdmin.secretary
    });
    expect(result).toEqual({ results: [], shouldFetchMore: false });
  });

  it("returns only pending companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [pendingCompany],
      [ApprovalStatus.pending],
      extensionAdmin.secretary
    );
  });

  it("returns only approved companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [approvedCompany],
      [ApprovalStatus.approved],
      extensionAdmin.secretary
    );
  });

  it("returns only rejected companies", async () => {
    await expectToFindAdminTasksWithStatuses(
      [rejectedCompany],
      [ApprovalStatus.rejected],
      extensionAdmin.secretary
    );
  });

  it("returns only pending applicants", async () => {
    await expectToFindAdminTasksWithStatuses(
      [pendingApplicant],
      [ApprovalStatus.pending],
      extensionAdmin.secretary
    );
  });

  it("returns only approved applicants", async () => {
    await expectToFindAdminTasksWithStatuses(
      [approvedApplicant],
      [ApprovalStatus.approved],
      extensionAdmin.secretary
    );
  });

  it("returns only rejected applicants", async () => {
    await expectToFindAdminTasksWithStatuses(
      [rejectedApplicant],
      [ApprovalStatus.rejected],
      extensionAdmin.secretary
    );
  });

  it("returns only pending offers", async () => {
    await expectToFindAdminTasksWithStatuses(
      [pendingOffer],
      [ApprovalStatus.pending],
      extensionAdmin.secretary
    );
  });

  it("returns only approved offers", async () => {
    await expectToFindAdminTasksWithStatuses(
      [approvedOffer],
      [ApprovalStatus.approved],
      extensionAdmin.secretary
    );
  });

  it("returns only rejected offers", async () => {
    await expectToFindAdminTasksWithStatuses(
      [rejectedOffer],
      [ApprovalStatus.rejected],
      extensionAdmin.secretary
    );
  });

  it("returns only pending by extension secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [pendingByExtensionJobApplication],
      [ApprovalStatus.pending],
      extensionAdmin.secretary
    );
  });

  it("returns only approved by extension secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [approvedByExtensionJobApplication],
      [ApprovalStatus.approved],
      extensionAdmin.secretary
    );
  });

  it("returns only rejected by extension secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [rejectedByExtensionJobApplication],
      [ApprovalStatus.rejected],
      extensionAdmin.secretary
    );
  });

  it("returns only pending by graduados secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [pendingByGraduadosJobApplication],
      [ApprovalStatus.pending],
      graduadosAdmin.secretary
    );
  });

  it("returns only approved by graduados secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [approvedByGraduadosJobApplication],
      [ApprovalStatus.approved],
      graduadosAdmin.secretary
    );
  });

  it("returns only rejected by graduados secretary jobApplications", async () => {
    await expectToFindAdminTasksWithStatuses(
      [rejectedByGraduadosJobApplication],
      [ApprovalStatus.rejected],
      graduadosAdmin.secretary
    );
  });

  it("returns only pending applicants, companies and Offers", async () => {
    await expectToFindAdminTasksWithStatuses(
      [pendingCompany, pendingApplicant, pendingOffer],
      [ApprovalStatus.pending],
      extensionAdmin.secretary
    );
  });

  it("returns only approved and rejected applicants, companies and Offers", async () => {
    await expectToFindAdminTasksWithStatuses(
      [
        approvedCompany,
        rejectedCompany,
        approvedApplicant,
        rejectedApplicant,
        approvedOffer,
        rejectedOffer
      ],
      [ApprovalStatus.approved, ApprovalStatus.rejected],
      extensionAdmin.secretary
    );
  });

  it("sorts pending applicants, companies, offers and jobApplications by updatedAt in any status", async () => {
    const result = await AdminTaskRepository.find({
      adminTaskTypes: [
        AdminTaskType.Applicant,
        AdminTaskType.Company,
        AdminTaskType.Offer,
        AdminTaskType.JobApplication
      ],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: extensionAdmin.secretary
    });
    expect(result.results.map(adminTask => adminTask.uuid)).toEqual(
      allTasksByDescUpdatedAt.map(task => task.uuid)
    );
    expect(result.results).toBeSortedBy({ key: "updatedAt", order: "desc" });
    expect(result.shouldFetchMore).toEqual(false);
  });

  it("limits to itemsPerPage results", async () => {
    const itemsPerPage = 3;
    mockItemsPerPage(itemsPerPage);
    const lastTaskIndex = 1;
    const lastTask = allTasksByDescUpdatedAt[lastTaskIndex];
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
      secretary: extensionAdmin.secretary
    });
    expect(result.shouldFetchMore).toEqual(true);
    expect(result.results.map(task => task.uuid)).toEqual(
      allTasksByDescUpdatedAt
        .map(task => task.uuid)
        .slice(lastTaskIndex + 1, lastTaskIndex + 1 + itemsPerPage)
    );
  });

  describe("when there are tasks with equal updatedAt", () => {
    let firstTask: AdminTask;
    const companies: Company[] = [];

    beforeAll(async () => {
      firstTask = allTasksByDescUpdatedAt[allTasksByDescUpdatedAt.length - 1];
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
        secretary: extensionAdmin.secretary
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
