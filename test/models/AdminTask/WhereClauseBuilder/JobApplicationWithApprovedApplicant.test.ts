import { JobApplicationWithApprovedApplicantWhereClause } from "$models/AdminTask/WhereClauseBuilder/JobApplicationWithApprovedApplicant";
import { AdminTaskType } from "$models/AdminTask";

describe("JobApplicationWithApprovedApplicantWhereClause", () => {
  it("returns an empty clause if model is Applicant", async () => {
    const whereClause = JobApplicationWithApprovedApplicantWhereClause.build({
      modelName: AdminTaskType.Applicant
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Offer", async () => {
    const whereClause = JobApplicationWithApprovedApplicantWhereClause.build({
      modelName: AdminTaskType.Offer
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Company", async () => {
    const whereClause = JobApplicationWithApprovedApplicantWhereClause.build({
      modelName: AdminTaskType.Company
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for jobApplications with approved applicant", async () => {
    const whereClause = JobApplicationWithApprovedApplicantWhereClause.build({
      modelName: AdminTaskType.JobApplication
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        EXISTS (
          SELECT *
          FROM "Applicants"
          WHERE "JobApplications"."applicantUuid" = "Applicants"."uuid"
          AND "Applicants"."approvalStatus" = 'approved'
        )
      )
    `);
  });
});
