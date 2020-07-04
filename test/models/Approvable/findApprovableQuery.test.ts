import { Database } from "../../../src/config/Database";
import { findApprovableQuery } from "../../../src/models/Approvable/findApprovableQuery";
import { ApprovableEntityType } from "../../../src/models/Approvable";

describe("findApprovableQuery", () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());

  it("returns an sql query of all approvable entities", async () => {
    const query = findApprovableQuery({});
    const expectedQuery = `
      SELECT
        COALESCE (Companies."uuid",Applicants."uuid") AS "uuid",
        COALESCE (Companies."cuit") AS "cuit",
        COALESCE (Companies."companyName") AS "companyName",
        COALESCE (Companies."slogan") AS "slogan",
        COALESCE (Companies."description",Applicants."description") AS "description",
        COALESCE (Companies."logo") AS "logo",
        COALESCE (Companies."website") AS "website",
        COALESCE (Companies."email") AS "email",
        COALESCE (Companies."approvalStatus",Applicants."approvalStatus") AS "approvalStatus",
        COALESCE (Companies."createdAt",Applicants."createdAt") AS "createdAt",
        COALESCE (Companies."updatedAt",Applicants."updatedAt") AS "updatedAt",
        COALESCE (Companies."tableNameColumn",Applicants."tableNameColumn") AS "tableNameColumn",
        COALESCE (Applicants."padron") AS "padron",
        COALESCE (Applicants."userUuid") AS "userUuid"
      FROM (
        (SELECT *, 'Companies' AS "tableNameColumn" FROM "Companies") AS Companies
        FULL OUTER JOIN
        (SELECT *, 'Applicants' AS "tableNameColumn" FROM "Applicants") AS Applicants ON FALSE
        )
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  });

  it("returns an sql query of all Applicants", async () => {
    const query = findApprovableQuery({ approvableEntityTypes: [ApprovableEntityType.Applicant] });
    const expectedQuery = `
      SELECT
        COALESCE (Applicants."uuid") AS "uuid",
        COALESCE (Applicants."description") AS "description",
        COALESCE (Applicants."approvalStatus") AS "approvalStatus",
        COALESCE (Applicants."createdAt") AS "createdAt",
        COALESCE (Applicants."updatedAt") AS "updatedAt",
        COALESCE (Applicants."tableNameColumn") AS "tableNameColumn",
        COALESCE (Applicants."padron") AS "padron",
        COALESCE (Applicants."userUuid") AS "userUuid"
      FROM (SELECT *, 'Applicants' AS "tableNameColumn" FROM "Applicants") AS Applicants
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  });

  it("returns an sql query of all Companies", async () => {
    const query = findApprovableQuery({ approvableEntityTypes: [ApprovableEntityType.Company] });
    const expectedQuery = `
      SELECT
        COALESCE (Companies."uuid") AS "uuid",
        COALESCE (Companies."cuit") AS "cuit",
        COALESCE (Companies."companyName") AS "companyName",
        COALESCE (Companies."slogan") AS "slogan",
        COALESCE (Companies."description") AS "description",
        COALESCE (Companies."logo") AS "logo",
        COALESCE (Companies."website") AS "website",
        COALESCE (Companies."email") AS "email",
        COALESCE (Companies."approvalStatus") AS "approvalStatus",
        COALESCE (Companies."createdAt") AS "createdAt",
        COALESCE (Companies."updatedAt") AS "updatedAt",
        COALESCE (Companies."tableNameColumn") AS "tableNameColumn"
      FROM (SELECT *, 'Companies' AS "tableNameColumn" FROM "Companies") AS Companies
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  });
});
