import { JobApplicationWithApprovedOfferWhereClause } from "$models/AdminTask/WhereClauseBuilder/JobApplicationWithApprovedOffer";
import { AdminTaskType } from "$models/AdminTask";
import { Secretary } from "$models/Admin";

describe("JobApplicationWithApprovedOfferWhereClause", () => {
  it("returns an empty clause if model is Applicant", async () => {
    const whereClause = JobApplicationWithApprovedOfferWhereClause.build({
      secretary: Secretary.extension,
      modelName: AdminTaskType.Applicant
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Offer", async () => {
    const whereClause = JobApplicationWithApprovedOfferWhereClause.build({
      secretary: Secretary.extension,
      modelName: AdminTaskType.Offer
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Company", async () => {
    const whereClause = JobApplicationWithApprovedOfferWhereClause.build({
      secretary: Secretary.extension,
      modelName: AdminTaskType.Company
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for jobApplications with approved offer for extension", async () => {
    const whereClause = JobApplicationWithApprovedOfferWhereClause.build({
      secretary: Secretary.extension,
      modelName: AdminTaskType.JobApplication
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        EXISTS (
          SELECT *
          FROM "Offers"
          WHERE "JobApplications"."offerUuid" = "Offers"."uuid"
          AND "Offers"."extensionApprovalStatus" = 'approved'
        )
      )
    `);
  });

  it("builds where clause for jobApplications with approved offer for graduados", async () => {
    const whereClause = JobApplicationWithApprovedOfferWhereClause.build({
      secretary: Secretary.graduados,
      modelName: AdminTaskType.JobApplication
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        EXISTS (
          SELECT *
          FROM "Offers"
          WHERE "JobApplications"."offerUuid" = "Offers"."uuid"
          AND "Offers"."graduadosApprovalStatus" = 'approved'
        )
      )
    `);
  });
});
