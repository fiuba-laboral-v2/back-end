import { findAdminTasksQuery } from "../../../src/models/AdminTask/findAdminTasksQuery";
import { AdminTaskType } from "../../../src/models/AdminTask";
import {
  AdminTaskTypesIsEmptyError,
  StatusesIsEmptyError
} from "../../../src/models/AdminTask/Errors";
import { ApprovalStatus } from "../../../src/models/ApprovalStatus";

describe("findAdminTasksQuery", () => {

  const expectToReturnSQLQueryOfAllAdminTasksWithStatus = (status: ApprovalStatus) => {
    const query = findAdminTasksQuery({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company],
      statuses: [status]
    });
    const expectedQuery = `
      WITH "AdminTask" AS
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
      SELECT * FROM "AdminTask"
      WHERE "AdminTask"."approvalStatus" = '${status}'
      ORDER BY "AdminTask"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  };

  const expectToReturnSQLQueryOfCompaniesWithStatus = (status: ApprovalStatus) => {
    const query = findAdminTasksQuery({
      adminTaskTypes: [AdminTaskType.Company],
      statuses: [status]
    });
    const expectedQuery = `
      WITH "AdminTask" AS
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
      SELECT * FROM "AdminTask"
      WHERE "AdminTask"."approvalStatus" = '${status}'
      ORDER BY "AdminTask"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  };

  const expectToReturnSQLQueryOfApplicantsWithStatus = (status: ApprovalStatus) => {
    const query = findAdminTasksQuery({
      adminTaskTypes: [AdminTaskType.Applicant],
      statuses: [status]
    });
    const expectedQuery = `
      WITH "AdminTask" AS
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
      SELECT * FROM "AdminTask"
      WHERE "AdminTask"."approvalStatus" = '${status}'
      ORDER BY "AdminTask"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  };

  it("throws an error if no adminTaskTypes are provided", async () => {
    expect(
      () => findAdminTasksQuery({
        adminTaskTypes: [],
        statuses: [ApprovalStatus.pending]
      })
    ).toThrowErrorWithMessage(
      AdminTaskTypesIsEmptyError,
      AdminTaskTypesIsEmptyError.buildMessage()
    );
  });

  it("throws an error if no statuses are provided", async () => {
    expect(
      () => findAdminTasksQuery({
        adminTaskTypes: [AdminTaskType.Applicant],
        statuses: []
      })
    ).toThrowErrorWithMessage(
      StatusesIsEmptyError,
      StatusesIsEmptyError.buildMessage()
    );
  });

  it("returns an sql query of adminTasks in pending status", async () => {
    expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.pending);
  });

  it("returns an sql query of adminTasks in approved status", async () => {
    expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.approved);
  });

  it("returns an sql query of adminTasks in rejected status", async () => {
    expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.rejected);
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

  it("returns an sql query of adminTasks in all statuses", async () => {
    const query = findAdminTasksQuery({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company],
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected]
    });
    const expectedQuery = `
      WITH "AdminTask" AS
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
      SELECT * FROM "AdminTask"
      WHERE "AdminTask"."approvalStatus" = 'pending'
            OR "AdminTask"."approvalStatus" = 'approved'
            OR "AdminTask"."approvalStatus" = 'rejected'
      ORDER BY "AdminTask"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  });

  it("returns an sql query of adminTasks in approved and rejected statuses", async () => {
    const query = findAdminTasksQuery({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company],
      statuses: [ApprovalStatus.approved, ApprovalStatus.rejected]
    });
    const expectedQuery = `
      WITH "AdminTask" AS
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
      SELECT * FROM "AdminTask"
      WHERE "AdminTask"."approvalStatus" = 'approved'
            OR "AdminTask"."approvalStatus" = 'rejected'
      ORDER BY "AdminTask"."updatedAt" DESC
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  });
});
