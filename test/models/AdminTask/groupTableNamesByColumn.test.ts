import { groupTableNamesByColumn } from "$models/AdminTask/groupTableNamesByColumn";
import { ADMIN_TASK_MODELS } from "$models/AdminTask";
import { Applicant, Company, Offer } from "$models";

describe("groupTableNamesByColumn", () => {
  it("groups each column as a key and their related tableNames as values", async () => {
    const APPLICANTS_TABLE_NAME = Applicant.tableName;
    const COMPANIES_TABLE_NAME = Company.tableName;
    const tableNamesByColumn = groupTableNamesByColumn(ADMIN_TASK_MODELS);
    expect(tableNamesByColumn).toMatchObject({
      uuid: expect.arrayContaining([APPLICANTS_TABLE_NAME, COMPANIES_TABLE_NAME]),
      padron: expect.arrayContaining([APPLICANTS_TABLE_NAME]),
      description: expect.arrayContaining([APPLICANTS_TABLE_NAME, COMPANIES_TABLE_NAME]),
      userUuid: expect.arrayContaining([APPLICANTS_TABLE_NAME]),
      approvalStatus: expect.arrayContaining([COMPANIES_TABLE_NAME, APPLICANTS_TABLE_NAME]),
      cuit: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      companyName: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      slogan: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      logo: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      website: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      email: expect.arrayContaining([COMPANIES_TABLE_NAME])
    });
  });

  it("groups each Applicant column as a key", async () => {
    const APPLICANTS_TABLE_NAME = Applicant.tableName;
    const tableNamesByColumn = groupTableNamesByColumn([Applicant]);
    expect(tableNamesByColumn).toMatchObject({
      uuid: expect.arrayContaining([APPLICANTS_TABLE_NAME]),
      padron: expect.arrayContaining([APPLICANTS_TABLE_NAME]),
      description: expect.arrayContaining([APPLICANTS_TABLE_NAME]),
      userUuid: expect.arrayContaining([APPLICANTS_TABLE_NAME]),
      approvalStatus: expect.arrayContaining([APPLICANTS_TABLE_NAME])
    });
  });

  it("groups each Company column as a key", async () => {
    const COMPANIES_TABLE_NAME = Company.tableName;
    const tableNamesByColumn = groupTableNamesByColumn([Company]);
    expect(tableNamesByColumn).toMatchObject({
      uuid: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      description: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      approvalStatus: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      cuit: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      companyName: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      slogan: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      logo: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      website: expect.arrayContaining([COMPANIES_TABLE_NAME]),
      email: expect.arrayContaining([COMPANIES_TABLE_NAME])
    });
  });

  it("groups each Offer column as a key", async () => {
    const OFFER_TABLE_NAME = Offer.tableName;
    const tableNamesByColumn = groupTableNamesByColumn([Offer]);
    expect(tableNamesByColumn).toMatchObject({
      uuid: expect.arrayContaining([OFFER_TABLE_NAME]),
      description: expect.arrayContaining([OFFER_TABLE_NAME]),
      companyUuid: expect.arrayContaining([OFFER_TABLE_NAME]),
      title: expect.arrayContaining([OFFER_TABLE_NAME]),
      hoursPerDay: expect.arrayContaining([OFFER_TABLE_NAME]),
      minimumSalary: expect.arrayContaining([OFFER_TABLE_NAME]),
      maximumSalary: expect.arrayContaining([OFFER_TABLE_NAME]),
      graduadosApprovalStatus: expect.arrayContaining([OFFER_TABLE_NAME]),
      extensionApprovalStatus: expect.arrayContaining([OFFER_TABLE_NAME])
    });
  });
});
