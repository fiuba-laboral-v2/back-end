import { Database } from "../../../src/config/Database";
import { groupTableNamesByColumn } from "../../../src/models/Approvable/groupTableNamesByColumn";
import { Applicant } from "../../../src/models/Applicant";
import { Company } from "../../../src/models/Company";

describe("groupTableNamesByColumn", () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());

  it("groups each column as a key and their related tableNames as values", async () => {
    const APPLICANTS_TABLE_NAME = Applicant.tableName;
    const COMPANIES_TABLE_NAME = Company.tableName;
    const tableNamesByColumn = groupTableNamesByColumn();
    expect(tableNamesByColumn).toMatchObject(
      {
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
      }
    );
  });
});
