import { Database } from "../../../src/config/Database";
import { findApprovablesQuery } from "../../../src/models/Approvable/findApprovablesQuery";
import { ApprovableEntityType } from "../../../src/models/Approvable";
import { ApprovableEntityTypesIsEmptyError } from "../../../src/models/Approvable/Errors";
import { ApprovalStatus } from "../../../src/models/ApprovalStatus";

describe("findApprovablesQuery", () => {
  beforeAll(() => Database.setConnection());
  afterAll(() => Database.close());

  const expectToReturnSQLQueryOfAllApprovableEntitiesWithStatus = (status: ApprovalStatus) => {
    const query = findApprovablesQuery({
      approvableEntityTypes: [ApprovableEntityType.Applicant, ApprovableEntityType.Company],
      statuses: [status]
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
      WHERE "Approvable"."approvalStatus" = '${status}'
      ORDER BY "Approvable"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  };

  const expectToReturnSQLQueryOfCompaniesWithStatus = (status: ApprovalStatus) => {
    const query = findApprovablesQuery({
      approvableEntityTypes: [ApprovableEntityType.Company],
      statuses: [status]
    });
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
      WHERE "Approvable"."approvalStatus" = '${status}'
      ORDER BY "Approvable"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  };

  const expectToReturnSQLQueryOfApplicantsWithStatus = (status: ApprovalStatus) => {
    const query = findApprovablesQuery({
      approvableEntityTypes: [ApprovableEntityType.Applicant],
      statuses: [status]
    });
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
      WHERE "Approvable"."approvalStatus" = '${status}'
      ORDER BY "Approvable"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  };

  it("throws an error if no approvableEntityTypes are provided", async () => {
    expect(
      () => findApprovablesQuery({
        approvableEntityTypes: [],
        statuses: [ApprovalStatus.pending]
      })
    ).toThrowErrorWithMessage(
      ApprovableEntityTypesIsEmptyError,
      ApprovableEntityTypesIsEmptyError.buildMessage()
    );
  });

  it("throws an error if no statuses are provided", async () => {
    expect(
      () => findApprovablesQuery({
        approvableEntityTypes: [ApprovableEntityType.Applicant],
        statuses: []
      })
    ).toThrowErrorWithMessage(
      ApprovableEntityTypesIsEmptyError,
      ApprovableEntityTypesIsEmptyError.buildMessage()
    );
  });

  it("returns an sql query of approvable entities in pending status", async () => {
    expectToReturnSQLQueryOfAllApprovableEntitiesWithStatus(ApprovalStatus.pending);
  });

  it("returns an sql query of approvable entities in approved status", async () => {
    expectToReturnSQLQueryOfAllApprovableEntitiesWithStatus(ApprovalStatus.approved);
  });

  it("returns an sql query of approvable entities in rejected status", async () => {
    expectToReturnSQLQueryOfAllApprovableEntitiesWithStatus(ApprovalStatus.rejected);
  });

  it("returns an sql query of Companies in pending status", async () => {
    expectToReturnSQLQueryOfCompaniesWithStatus(ApprovalStatus.pending);
  });

  it("returns an sql query of Companies in approved status", async () => {
    expectToReturnSQLQueryOfCompaniesWithStatus(ApprovalStatus.approved);
  });

  it("returns an sql query of Companies in rejected status", async () => {
    expectToReturnSQLQueryOfCompaniesWithStatus(ApprovalStatus.rejected);
  });

  it("returns an sql query of Applicants in pending status", async () => {
    expectToReturnSQLQueryOfApplicantsWithStatus(ApprovalStatus.pending);
  });

  it("returns an sql query of Applicants in approved status", async () => {
    expectToReturnSQLQueryOfApplicantsWithStatus(ApprovalStatus.approved);
  });

  it("returns an sql query of Applicants in rejected status", async () => {
    expectToReturnSQLQueryOfApplicantsWithStatus(ApprovalStatus.rejected);
  });

  it("returns an sql query of approvable entities in all statuses", async () => {
    const query = findApprovablesQuery({
      approvableEntityTypes: [ApprovableEntityType.Applicant, ApprovableEntityType.Company],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected]
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
            OR "Approvable"."approvalStatus" = 'approved'
            OR "Approvable"."approvalStatus" = 'rejected'
      ORDER BY "Approvable"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  });

  it("returns an sql query of approvable entities in approved and rejected statuses", async () => {
    const query = findApprovablesQuery({
      approvableEntityTypes: [ApprovableEntityType.Applicant, ApprovableEntityType.Company],
      statuses: [ApprovalStatus.approved, ApprovalStatus.rejected]
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
      WHERE "Approvable"."approvalStatus" = 'approved'
            OR "Approvable"."approvalStatus" = 'rejected'
      ORDER BY "Approvable"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  });
});
