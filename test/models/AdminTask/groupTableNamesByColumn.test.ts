import { groupTableNamesByColumn } from "$models/AdminTask/groupTableNamesByColumn";
import { ADMIN_TASK_MODELS } from "$models/AdminTask";
import { Applicant, Company, Offer, JobApplication } from "$models";

describe("groupTableNamesByColumn", () => {
  it("groups each column as a key and their related tableNames as values", async () => {
    const APPLICANTS_TABLE_NAME = Applicant.tableName;
    const COMPANIES_TABLE_NAME = Company.tableName;
    const OFFER_TABLE_NAME = Offer.tableName;
    const JOB_APPLICATION_TABLE_NAME = JobApplication.tableName;
    const ALL_TABLE_NAMES = [
      APPLICANTS_TABLE_NAME,
      COMPANIES_TABLE_NAME,
      OFFER_TABLE_NAME,
      JOB_APPLICATION_TABLE_NAME
    ];
    const tableNamesByColumn = groupTableNamesByColumn(ADMIN_TASK_MODELS);
    expect(tableNamesByColumn).toEqual({
      uuid: expect.arrayContaining(ALL_TABLE_NAMES),
      padron: [APPLICANTS_TABLE_NAME],
      description: expect.arrayContaining([APPLICANTS_TABLE_NAME, COMPANIES_TABLE_NAME]),
      userUuid: [APPLICANTS_TABLE_NAME],
      approvalStatus: expect.arrayContaining([
        COMPANIES_TABLE_NAME,
        APPLICANTS_TABLE_NAME,
        JOB_APPLICATION_TABLE_NAME
      ]),
      cuit: [COMPANIES_TABLE_NAME],
      companyName: [COMPANIES_TABLE_NAME],
      slogan: [COMPANIES_TABLE_NAME],
      logo: [COMPANIES_TABLE_NAME],
      website: [COMPANIES_TABLE_NAME],
      email: [COMPANIES_TABLE_NAME],
      title: [OFFER_TABLE_NAME],
      companyUuid: [OFFER_TABLE_NAME],
      hoursPerDay: [OFFER_TABLE_NAME],
      minimumSalary: [OFFER_TABLE_NAME],
      maximumSalary: [OFFER_TABLE_NAME],
      targetApplicantType: [OFFER_TABLE_NAME],
      applicantUuid: [JOB_APPLICATION_TABLE_NAME],
      offerUuid: [JOB_APPLICATION_TABLE_NAME],
      graduadosApprovalStatus: [OFFER_TABLE_NAME],
      extensionApprovalStatus: [OFFER_TABLE_NAME],
      createdAt: expect.arrayContaining(ALL_TABLE_NAMES),
      updatedAt: expect.arrayContaining(ALL_TABLE_NAMES),
      tableNameColumn: expect.arrayContaining(ALL_TABLE_NAMES)
    });
  });

  it("groups each Applicant column as a key", async () => {
    const APPLICANTS_TABLE_NAME = Applicant.tableName;
    const tableNamesByColumn = groupTableNamesByColumn([Applicant]);
    expect(tableNamesByColumn).toEqual({
      uuid: [APPLICANTS_TABLE_NAME],
      padron: [APPLICANTS_TABLE_NAME],
      description: [APPLICANTS_TABLE_NAME],
      userUuid: [APPLICANTS_TABLE_NAME],
      approvalStatus: [APPLICANTS_TABLE_NAME],
      createdAt: [APPLICANTS_TABLE_NAME],
      updatedAt: [APPLICANTS_TABLE_NAME],
      tableNameColumn: [APPLICANTS_TABLE_NAME]
    });
  });

  it("groups each Company column as a key", async () => {
    const COMPANIES_TABLE_NAME = Company.tableName;
    const tableNamesByColumn = groupTableNamesByColumn([Company]);
    expect(tableNamesByColumn).toEqual({
      uuid: [COMPANIES_TABLE_NAME],
      description: [COMPANIES_TABLE_NAME],
      approvalStatus: [COMPANIES_TABLE_NAME],
      cuit: [COMPANIES_TABLE_NAME],
      companyName: [COMPANIES_TABLE_NAME],
      slogan: [COMPANIES_TABLE_NAME],
      logo: [COMPANIES_TABLE_NAME],
      website: [COMPANIES_TABLE_NAME],
      email: [COMPANIES_TABLE_NAME],
      createdAt: [COMPANIES_TABLE_NAME],
      updatedAt: [COMPANIES_TABLE_NAME],
      tableNameColumn: [COMPANIES_TABLE_NAME]
    });
  });

  it("groups each Offer column as a key", async () => {
    const OFFER_TABLE_NAME = Offer.tableName;
    const tableNamesByColumn = groupTableNamesByColumn([Offer]);
    expect(tableNamesByColumn).toEqual({
      uuid: [OFFER_TABLE_NAME],
      description: [OFFER_TABLE_NAME],
      companyUuid: [OFFER_TABLE_NAME],
      title: [OFFER_TABLE_NAME],
      hoursPerDay: [OFFER_TABLE_NAME],
      minimumSalary: [OFFER_TABLE_NAME],
      maximumSalary: [OFFER_TABLE_NAME],
      graduadosApprovalStatus: [OFFER_TABLE_NAME],
      extensionApprovalStatus: [OFFER_TABLE_NAME],
      targetApplicantType: [OFFER_TABLE_NAME],
      createdAt: [OFFER_TABLE_NAME],
      updatedAt: [OFFER_TABLE_NAME],
      tableNameColumn: [OFFER_TABLE_NAME]
    });
  });

  it("groups each JobApplication column as a key", async () => {
    const JOB_APPLICATION_TABLE_NAME = JobApplication.tableName;
    const tableNamesByColumn = groupTableNamesByColumn([JobApplication]);
    expect(tableNamesByColumn).toEqual({
      uuid: [JOB_APPLICATION_TABLE_NAME],
      offerUuid: [JOB_APPLICATION_TABLE_NAME],
      applicantUuid: [JOB_APPLICATION_TABLE_NAME],
      approvalStatus: [JOB_APPLICATION_TABLE_NAME],
      createdAt: [JOB_APPLICATION_TABLE_NAME],
      updatedAt: [JOB_APPLICATION_TABLE_NAME],
      tableNameColumn: [JOB_APPLICATION_TABLE_NAME]
    });
  });
});
