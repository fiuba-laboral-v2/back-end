import { OfferTargetWhereClause } from "$models/AdminTask/WhereClauseBuilder/OfferTarget";
import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask";
import { ApplicantType } from "$models/Applicant";
import { Offer } from "$models";

describe("OfferTargetWhereClause", () => {
  it("returns an empty clause if no Offer is in adminTaskTypes", async () => {
    const whereClause = OfferTargetWhereClause.build({
      secretary: Secretary.graduados,
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.JobApplication, AdminTaskType.Company]
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for offers targeted to students", async () => {
    const whereClause = OfferTargetWhereClause.build({
      secretary: Secretary.extension,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
    `);
  });

  it("builds where clause for offers targeted to graduates", async () => {
    const whereClause = OfferTargetWhereClause.build({
      secretary: Secretary.graduados,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
    `);
  });
});
