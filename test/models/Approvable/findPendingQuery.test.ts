import { Database } from "../../../src/config/Database";
import { findPendingQuery } from "../../../src/models/Approvable/findPendingQuery";
import { ApprovableEntityType } from "../../../src/models/Approvable";
import { ApprovableEntityTypesIsEmptyError } from "../../../src/models/Approvable/Errors";

describe("findPendingQuery", () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());

  it("returns an sql query of approvable entities in pending status", async () => {
    const query = findPendingQuery({
      approvableEntityTypes: [ApprovableEntityType.Applicant, ApprovableEntityType.Company]
    });
    const expectedQuery = `
      WITH "Approvable" AS
        (
          SELECT
            COALESCE(Companies."uuid",Applicants."uuid") AS "uuid",
            COALESCE(Companies."cuit") AS "cuit",
            COALESCE(Companies."companyName") AS "companyName",
            COALESCE(Companies."slogan") AS "slogan",
            COALESCE(Companies."description",Applicants."description") AS "description",
            COALESCE(Companies."logo") AS "logo",
            COALESCE(Companies."website") AS "website",
            COALESCE(Companies."email") AS "email",
            COALESCE(Companies."approvalStatus",Applicants."approvalStatus") AS "approvalStatus",
            COALESCE(Companies."createdAt",Applicants."createdAt") AS "createdAt",
            COALESCE(Companies."updatedAt",Applicants."updatedAt") AS "updatedAt",
            COALESCE(Companies."tableNameColumn",Applicants."tableNameColumn") AS "tableNameColumn",
            COALESCE(Applicants."padron") AS "padron",
            COALESCE(Applicants."userUuid") AS "userUuid"
          FROM (
            (SELECT *, 'Companies' AS "tableNameColumn" FROM "Companies") AS Companies
            FULL OUTER JOIN
            (SELECT *, 'Applicants' AS "tableNameColumn" FROM "Applicants") AS Applicants ON FALSE
            )
        )
      SELECT * FROM "Approvable"
      WHERE "Approvable"."approvalStatus" = 'pending'
      ORDER BY "Approvable"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  });

  it("throws an error if no approvableEntityTypes are provided", async () => {
    expect(
      () => findPendingQuery({ approvableEntityTypes: [] })
    ).toThrowErrorWithMessage(
      ApprovableEntityTypesIsEmptyError,
      ApprovableEntityTypesIsEmptyError.buildMessage()
    );
  });

  it("returns an sql query of Companies in pending status", async () => {
    const query = findPendingQuery({ approvableEntityTypes: [ApprovableEntityType.Company] });
    const expectedQuery = `
      WITH "Approvable" AS
        (
          SELECT
            COALESCE(Companies."uuid") AS "uuid",
            COALESCE(Companies."cuit") AS "cuit",
            COALESCE(Companies."companyName") AS "companyName",
            COALESCE(Companies."slogan") AS "slogan",
            COALESCE(Companies."description") AS "description",
            COALESCE(Companies."logo") AS "logo",
            COALESCE(Companies."website") AS "website",
            COALESCE(Companies."email") AS "email",
            COALESCE(Companies."approvalStatus") AS "approvalStatus",
            COALESCE(Companies."createdAt") AS "createdAt",
            COALESCE(Companies."updatedAt") AS "updatedAt",
            COALESCE(Companies."tableNameColumn") AS "tableNameColumn"
          FROM (SELECT *, 'Companies' AS "tableNameColumn" FROM "Companies") AS Companies
        )
      SELECT * FROM "Approvable"
      WHERE "Approvable"."approvalStatus" = 'pending'
      ORDER BY "Approvable"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  });

  it("returns an sql query of Applicants in pending status", async () => {
    const query = findPendingQuery({ approvableEntityTypes: [ApprovableEntityType.Applicant] });
    const expectedQuery = `
      WITH "Approvable" AS
        (
          SELECT
            COALESCE(Applicants."uuid") AS "uuid",
            COALESCE(Applicants."description") AS "description",
            COALESCE(Applicants."approvalStatus") AS "approvalStatus",
            COALESCE(Applicants."createdAt") AS "createdAt",
            COALESCE(Applicants."updatedAt") AS "updatedAt",
            COALESCE(Applicants."tableNameColumn") AS "tableNameColumn",
            COALESCE(Applicants."padron") AS "padron",
            COALESCE(Applicants."userUuid") AS "userUuid"
          FROM (SELECT *, 'Applicants' AS "tableNameColumn" FROM "Applicants") AS Applicants
        )
      SELECT * FROM "Approvable"
      WHERE "Approvable"."approvalStatus" = 'pending'
      ORDER BY "Approvable"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  });
});
