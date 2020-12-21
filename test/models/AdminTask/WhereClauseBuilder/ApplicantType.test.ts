import { ApplicantTypeWhereClause } from "$models/AdminTask/WhereClauseBuilder/ApplicantType";
import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask";
import { ApplicantCareer, Applicant, Offer, JobApplication, Company } from "$models";

describe("ApplicantTypeWhereClause", () => {
  it("returns an empty clause if model is Offer", async () => {
    const whereClause = ApplicantTypeWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Offer.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is JobApplication", async () => {
    const whereClause = ApplicantTypeWhereClause.build({
      secretary: Secretary.graduados,
      modelName: JobApplication.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Company", async () => {
    const whereClause = ApplicantTypeWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Company.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for graduates", async () => {
    const whereClause = ApplicantTypeWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Applicant.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "Applicants"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for students", async () => {
    const whereClause = ApplicantTypeWhereClause.build({
      secretary: Secretary.extension,
      modelName: Applicant.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "Applicants"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });
});
