import { StatusWhereClause } from "$models/AdminTask/WhereClauseBuilder/Status";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask";

describe("StatusWhereClause", () => {
  it("builds all status where clause for extension secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds all status where clause for graduados secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds clause for all status for shared status tasks for extension secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.JobApplication]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds clause for all status for shared status tasks for graduados secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.JobApplication]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds clause for approved status for shared status tasks for extension secretary", async () => {
    const whereClause = StatusWhereClause.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.extension,
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.JobApplication]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
      )
    `);
  });
});
