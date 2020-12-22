import { JobApplicationTargetWhereClause } from "$models/AdminTask/WhereClauseBuilder/JobApplicationTarget";
import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask";
import { ApplicantCareer, JobApplication, Offer, Company, Applicant } from "$models";

describe("JobApplicationTargetWhereClause", () => {
  it("returns an empty clause if model is Offer", async () => {
    const whereClause = JobApplicationTargetWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Offer.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Applicant", async () => {
    const whereClause = JobApplicationTargetWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Applicant.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Company", async () => {
    const whereClause = JobApplicationTargetWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Company.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for graduates", async () => {
    const whereClause = JobApplicationTargetWhereClause.build({
      secretary: Secretary.graduados,
      modelName: JobApplication.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "JobApplications"."applicantUuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for students", async () => {
    const whereClause = JobApplicationTargetWhereClause.build({
      secretary: Secretary.extension,
      modelName: JobApplication.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "JobApplications"."applicantUuid" AND "isGraduate" = true
        )
      )
    `);
  });
});
