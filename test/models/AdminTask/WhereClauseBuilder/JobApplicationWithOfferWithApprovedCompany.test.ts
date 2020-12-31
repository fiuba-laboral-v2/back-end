import { JobApplicationWithOfferWithApprovedCompanyWhereClause } from "$models/AdminTask/WhereClauseBuilder/JobApplicationWithOfferWithApprovedCompany";
import { AdminTaskType } from "$models/AdminTask";

describe("JobApplicationWithOfferWithApprovedCompanyWhereClause", () => {
  it("returns an empty clause if model is Applicant", async () => {
    const whereClause = JobApplicationWithOfferWithApprovedCompanyWhereClause.build({
      modelName: AdminTaskType.Applicant
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Offer", async () => {
    const whereClause = JobApplicationWithOfferWithApprovedCompanyWhereClause.build({
      modelName: AdminTaskType.Offer
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Company", async () => {
    const whereClause = JobApplicationWithOfferWithApprovedCompanyWhereClause.build({
      modelName: AdminTaskType.Company
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for jobApplications with offer with approved company", async () => {
    const whereClause = JobApplicationWithOfferWithApprovedCompanyWhereClause.build({
      modelName: AdminTaskType.JobApplication
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        EXISTS (
          SELECT *
          FROM "Offers"
          WHERE "JobApplications"."offerUuid" = "Offers"."uuid"
          AND EXISTS (
            SELECT *
            FROM "Companies"
            WHERE "Offers"."companyUuid" = "Companies"."uuid"
            AND "Companies"."approvalStatus" = 'approved'
          )
        )
      )
    `);
  });
});
