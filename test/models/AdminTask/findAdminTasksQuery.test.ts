import { findAdminTasksQuery } from "$models/AdminTask/findAdminTasksQuery";
import { AdminTaskType } from "$models/AdminTask";
import { AdminTaskTypesIsEmptyError, StatusesIsEmptyError } from "$models/AdminTask/Errors";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

describe("findAdminTasksQuery", () => {
  const secretaryColumn = (secretary: Secretary) =>
    secretary === Secretary.graduados ? "graduadosApprovalStatus" : "extensionApprovalStatus";

  const setUpdatedBeforeThan = ({ dateTime, uuid }: IPaginatedInput) => {
    const whereClause: string[] = [];
    if (!dateTime && !uuid) return "";
    whereClause.push(`("AdminTask"."updatedAt" < '${dateTime.toISOString()}')`);
    whereClause.push(
      `("AdminTask"."updatedAt" = '${dateTime.toISOString()}' AND  "AdminTask"."uuid" < '${uuid}')`
    );
    return whereClause.join(" OR ");
  };

  const expectToReturnSQLQueryOfAllAdminTasksWithStatus = (
    status: ApprovalStatus | ApprovalStatus[],
    secretary: Secretary,
    updatedBeforeThan?: IPaginatedInput
  ) => {
    const limit = 15;
    const statuses = Array.isArray(status) ? status : [status];
    const query = findAdminTasksQuery({
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.Offer],
      statuses,
      limit,
      secretary,
      ...(updatedBeforeThan && { updatedBeforeThan })
    });

    const commonStatus = statuses.map(
      selectedStatus => `"AdminTask"."approvalStatus" = '${selectedStatus}'`
    );
    const offerStatus = statuses.map(
      selectedStatus => `"AdminTask"."${secretaryColumn(secretary)}" = '${selectedStatus}'`
    );
    const adminTaskWhereStatus = commonStatus.concat(offerStatus).join(" OR ");

    const whereUpdatedBeforeThan = updatedBeforeThan
      ? ` AND (${setUpdatedBeforeThan(updatedBeforeThan)})`
      : "";

    const expectedQuery = `
    WITH "AdminTask" AS (
      SELECT COALESCE (
        Applicants."tableNameColumn",Companies."tableNameColumn",Offers."tableNameColumn"
      ) AS "tableNameColumn",
      COALESCE ( Applicants."uuid",Companies."uuid",Offers."uuid" ) AS "uuid",
      COALESCE ( Applicants."padron" ) AS "padron",
      COALESCE (
        Applicants."description",Companies."description",Offers."description"
      ) AS "description",
      COALESCE ( Applicants."userUuid" ) AS "userUuid",
      COALESCE ( Applicants."approvalStatus",Companies."approvalStatus" ) AS "approvalStatus",
      COALESCE ( Applicants."createdAt",Companies."createdAt",Offers."createdAt" ) AS "createdAt",
      COALESCE ( Applicants."updatedAt",Companies."updatedAt",Offers."updatedAt" ) AS "updatedAt",
      COALESCE ( Companies."cuit" ) AS "cuit",
      COALESCE ( Companies."companyName" ) AS "companyName",
      COALESCE ( Companies."slogan" ) AS "slogan",
      COALESCE ( Companies."logo" ) AS "logo",
      COALESCE ( Companies."website" ) AS "website",
      COALESCE ( Companies."email" ) AS "email",
      COALESCE ( Offers."companyUuid" ) AS "companyUuid",
      COALESCE ( Offers."title" ) AS "title",
      COALESCE ( Offers."extensionApprovalStatus" ) AS "extensionApprovalStatus",
      COALESCE ( Offers."graduadosApprovalStatus" ) AS "graduadosApprovalStatus",
      COALESCE ( Offers."hoursPerDay" ) AS "hoursPerDay",
      COALESCE ( Offers."minimumSalary" ) AS "minimumSalary",
      COALESCE ( Offers."maximumSalary" ) AS "maximumSalary"
      FROM ((
        SELECT *, 'Applicants' AS "tableNameColumn" FROM "Applicants"
      ) AS Applicants FULL OUTER JOIN (
        SELECT *, 'Companies' AS "tableNameColumn" FROM "Companies"
      ) AS Companies ON FALSE FULL OUTER JOIN (
        SELECT *, 'Offers' AS "tableNameColumn" FROM "Offers"
      ) AS Offers ON FALSE)
      )
      SELECT * FROM "AdminTask"
      WHERE (${adminTaskWhereStatus})${whereUpdatedBeforeThan}
      ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
      LIMIT ${limit}
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  };

  const expectToReturnSQLQueryOfCompaniesWithStatus = (status: ApprovalStatus) => {
    const limit = 50;
    const secretary = Secretary.graduados;
    const query = findAdminTasksQuery({
      adminTaskTypes: [AdminTaskType.Company],
      statuses: [status],
      limit,
      secretary
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
      WHERE ("AdminTask"."approvalStatus" = '${status}')
      ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
      LIMIT ${limit}
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  };

  const expectToReturnSQLQueryOfApplicantsWithStatus = (status: ApprovalStatus) => {
    const limit = 75;
    const secretary = Secretary.graduados;
    const query = findAdminTasksQuery({
      adminTaskTypes: [AdminTaskType.Applicant],
      statuses: [status],
      limit,
      secretary
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
      WHERE ("AdminTask"."approvalStatus" = '${status}')
      ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
      LIMIT ${limit}
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  };

  const expectToReturnSQLQueryOfOfferWithStatus = (
    status: ApprovalStatus,
    secretary: Secretary
  ) => {
    const limit = 75;
    const query = findAdminTasksQuery({
      adminTaskTypes: [AdminTaskType.Offer],
      statuses: [status],
      limit,
      secretary
    });
    const expectedQuery = `
      WITH "AdminTask" AS (
        SELECT  COALESCE ( Offers."tableNameColumn" ) AS "tableNameColumn",
          COALESCE ( Offers."uuid" ) AS "uuid",
          COALESCE ( Offers."companyUuid" ) AS "companyUuid",
          COALESCE ( Offers."title" ) AS "title",
          COALESCE ( Offers."description" ) AS "description",
          COALESCE ( Offers."extensionApprovalStatus" ) AS "extensionApprovalStatus",
          COALESCE ( Offers."graduadosApprovalStatus" ) AS "graduadosApprovalStatus",
          COALESCE ( Offers."hoursPerDay" ) AS "hoursPerDay",
          COALESCE ( Offers."minimumSalary" ) AS "minimumSalary",
          COALESCE ( Offers."maximumSalary" ) AS "maximumSalary",
          COALESCE ( Offers."createdAt" ) AS "createdAt",
          COALESCE ( Offers."updatedAt" ) AS "updatedAt"
        FROM (SELECT *, 'Offers' AS "tableNameColumn" FROM "Offers" ) AS Offers
      )
      SELECT * FROM "AdminTask"
      WHERE (
        "AdminTask"."${secretaryColumn(secretary)}" = '${status}'
      )
      ORDER BY "AdminTask"."updatedAt" DESC, "AdminTask"."uuid" DESC
      LIMIT ${limit}
    `;
    expect(query).toEqualIgnoringSpacing(expectedQuery);
  };

  it("throws an error if no adminTaskTypes are provided", async () => {
    expect(() =>
      findAdminTasksQuery({
        adminTaskTypes: [],
        statuses: [ApprovalStatus.pending],
        limit: 100,
        secretary: Secretary.graduados
      })
    ).toThrowErrorWithMessage(
      AdminTaskTypesIsEmptyError,
      AdminTaskTypesIsEmptyError.buildMessage()
    );
  });

  it("throws an error if no statuses are provided", async () => {
    expect(() =>
      findAdminTasksQuery({
        adminTaskTypes: [AdminTaskType.Applicant],
        statuses: [],
        limit: 150,
        secretary: Secretary.graduados
      })
    ).toThrowErrorWithMessage(StatusesIsEmptyError, StatusesIsEmptyError.buildMessage());
  });

  it("returns an sql query of adminTasks in pending status for extension secretary", async () => {
    expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.pending, Secretary.extension);
  });

  it("returns an sql query of adminTasks in pending status for graduados secretary", async () => {
    expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.pending, Secretary.graduados);
  });

  it("returns an sql query of adminTasks in approved status for extension secretary", async () => {
    expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.approved, Secretary.extension);
  });

  it("returns an sql query of adminTasks in approved status for graduados secretary", async () => {
    expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.approved, Secretary.graduados);
  });

  it("returns an sql query of adminTasks in rejected status for extension secretary", async () => {
    expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.rejected, Secretary.extension);
  });

  it("returns an sql query of adminTasks in rejected status for graduados secretary", async () => {
    expectToReturnSQLQueryOfAllAdminTasksWithStatus(ApprovalStatus.rejected, Secretary.graduados);
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

  it("returns an sql query of Offer in pending status for extension secretary", async () => {
    expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.pending, Secretary.extension);
  });

  it("returns an sql query of Offer in approved status for extension secretary", async () => {
    expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.approved, Secretary.extension);
  });

  it("returns an sql query of Offer in rejected status for extension secretary", async () => {
    expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.rejected, Secretary.extension);
  });

  it("returns an sql query of Offer in pending status for graduados secretary", async () => {
    expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.pending, Secretary.graduados);
  });

  it("returns an sql query of Offer in approved status for graduados secretary", async () => {
    expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.approved, Secretary.graduados);
  });

  it("returns an sql query of Offer in rejected status for graduados secretary", async () => {
    expectToReturnSQLQueryOfOfferWithStatus(ApprovalStatus.rejected, Secretary.graduados);
  });

  it("returns an sql query of adminTasks in all statuses for graduados secretary", async () => {
    const statuses = [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected];

    expectToReturnSQLQueryOfAllAdminTasksWithStatus(statuses, Secretary.graduados);
  });

  it("returns an sql query of adminTasks in all statuses for extension secretary", async () => {
    const statuses = [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected];

    expectToReturnSQLQueryOfAllAdminTasksWithStatus(statuses, Secretary.extension);
  });

  it("optionally filters by maximum updatedAt (not inclusive)", async () => {
    const statuses = [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected];

    expectToReturnSQLQueryOfAllAdminTasksWithStatus(statuses, Secretary.extension, {
      dateTime: new Date("1995-12-17T03:24:00Z"),
      uuid: "ec45bb65-6076-45ea-b5e2-844334c3238e"
    });
  });

  it("returns an sql query of adminTasks in approved and rejected statuses for extension secretary", async () => {
    const statuses = [ApprovalStatus.approved, ApprovalStatus.rejected];

    expectToReturnSQLQueryOfAllAdminTasksWithStatus(statuses, Secretary.extension);
  });

  it("returns an sql query of adminTasks in approved and rejected statuses for graduados secretary", async () => {
    const statuses = [ApprovalStatus.approved, ApprovalStatus.rejected];

    expectToReturnSQLQueryOfAllAdminTasksWithStatus(statuses, Secretary.graduados);
  });
});
