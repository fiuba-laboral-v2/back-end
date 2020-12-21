import { StatusWhereClause } from "$models/AdminTask/WhereClauseBuilder/Status";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask";
import { Applicant, Offer, Company, JobApplication } from "$models";

describe("StatusWhereClause", () => {
  it("builds all statuses Offers where clause for extension secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      tableName: Offer.tableName,
      modelName: Offer.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
        OR "Offers"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
        OR "Offers"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds all statuses Offers where clause for graduados secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      tableName: Offer.tableName,
      modelName: Offer.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."graduadosApprovalStatus" = '${ApprovalStatus.pending}'
        OR "Offers"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
        OR "Offers"."graduadosApprovalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds all statuses Applicants where clause for extension secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      tableName: Applicant.tableName,
      modelName: Applicant.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Applicants"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "Applicants"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "Applicants"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds all statuses Companies where clause for graduados secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      tableName: Company.tableName,
      modelName: Company.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Companies"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "Companies"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "Companies"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds pending and approved JobApplications where clause for extension secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved],
      secretary: Secretary.extension,
      tableName: JobApplication.tableName,
      modelName: JobApplication.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "JobApplications"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "JobApplications"."approvalStatus" = '${ApprovalStatus.approved}'
      )
    `);
  });

  it("builds approved JobApplications where clause for extension secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.extension,
      tableName: JobApplication.tableName,
      modelName: JobApplication.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "JobApplications"."approvalStatus" = '${ApprovalStatus.approved}'
      )
    `);
  });
});
