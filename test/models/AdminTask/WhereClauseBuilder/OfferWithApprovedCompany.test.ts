import { OfferWithApprovedCompanyWhereClause } from "$models/AdminTask/WhereClauseBuilder/OfferWithApprovedCompany";
import { AdminTaskType } from "$models/AdminTask";

describe("OfferWithApprovedCompanyWhereClause", () => {
  it("returns an empty clause if model is Applicant", async () => {
    const whereClause = OfferWithApprovedCompanyWhereClause.build({
      modelName: AdminTaskType.Applicant
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is JobApplication", async () => {
    const whereClause = OfferWithApprovedCompanyWhereClause.build({
      modelName: AdminTaskType.JobApplication
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Company", async () => {
    const whereClause = OfferWithApprovedCompanyWhereClause.build({
      modelName: AdminTaskType.Company
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for offers with approved company", async () => {
    const whereClause = OfferWithApprovedCompanyWhereClause.build({
      modelName: AdminTaskType.Offer
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        EXISTS (
          SELECT *
          FROM "Companies"
          WHERE "Offers"."companyUuid" = "Companies"."uuid"
          AND "Companies"."approvalStatus" = 'approved'
        )
      )
    `);
  });
});
