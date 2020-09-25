import { JobApplicationTargetWhereClause } from "$models/AdminTask/WhereClauseBuilder/JobApplicationTarget";
import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask";
import { ApplicantCareer, JobApplication } from "$models";

describe("JobApplicationTargetWhereClause", () => {
  it("returns an empty clause if no JobApplication is in adminTaskTypes", async () => {
    const whereClause = JobApplicationTargetWhereClause.build({
      secretary: Secretary.graduados,
      adminTaskTypes: [AdminTaskType.Offer, AdminTaskType.Applicant, AdminTaskType.Company]
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for graduates", async () => {
    const whereClause = JobApplicationTargetWhereClause.build({
      secretary: Secretary.graduados,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."tableNameColumn" != '${JobApplication.tableName}'
        OR EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."applicantUuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for students", async () => {
    const whereClause = JobApplicationTargetWhereClause.build({
      secretary: Secretary.extension,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."tableNameColumn" != '${JobApplication.tableName}'
        OR NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."applicantUuid" AND "isGraduate" = true
        )
      )
    `);
  });
});
