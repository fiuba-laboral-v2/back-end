import { TargetWhereClauseBuilder } from "$models/AdminTask/WhereClauseBuilder";
import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask";
import { ApplicantType } from "$models/Applicant";
import { Offer } from "$models";

describe("TargetWhereClauseBuilder", () => {
  it("builds where clause for offers targeted to graduates", async () => {
    const whereClause = TargetWhereClauseBuilder.build({
      secretary: Secretary.graduados,
      adminTaskTypes: [AdminTaskType.Offer]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
      OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
      OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
    `);
  });

  it("builds where clause for offers targeted to students", async () => {
    const whereClause = TargetWhereClauseBuilder.build({
      secretary: Secretary.extension,
      adminTaskTypes: [AdminTaskType.Offer]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
      OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
      OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
    `);
  });

  it("does not build where clause for not targeted tasks", async () => {
    const whereClause = TargetWhereClauseBuilder.build({
      secretary: Secretary.extension,
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.JobApplication]
    });
    expect(whereClause).toEqualIgnoringSpacing("");
  });

  it("builds where clause for all types for graduados secretary", async () => {
    const whereClause = TargetWhereClauseBuilder.build({
      secretary: Secretary.graduados,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
      OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
      OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
    `);
  });

  it("builds where clause for all types for extension secretary", async () => {
    const whereClause = TargetWhereClauseBuilder.build({
      secretary: Secretary.extension,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
      OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
      OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
    `);
  });
});
