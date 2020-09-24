import { ApplicantTypeWhereClause } from "$models/AdminTask/WhereClauseBuilder/ApplicantType";
import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask";
import { ApplicantCareer, Applicant } from "$models";

describe("ApplicantTypeWhereClause", () => {
  it("returns an empty clause if no Applicant is in adminTaskTypes", async () => {
    const whereClause = ApplicantTypeWhereClause.build({
      secretary: Secretary.graduados,
      adminTaskTypes: [AdminTaskType.Offer, AdminTaskType.JobApplication, AdminTaskType.Company]
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for graduates", async () => {
    const whereClause = ApplicantTypeWhereClause.build({
      secretary: Secretary.graduados,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for students", async () => {
    const whereClause = ApplicantTypeWhereClause.build({
      secretary: Secretary.extension,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });
});
