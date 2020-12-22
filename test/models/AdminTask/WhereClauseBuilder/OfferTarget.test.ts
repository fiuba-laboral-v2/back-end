import { OfferTargetWhereClause } from "$models/AdminTask/WhereClauseBuilder/OfferTarget";
import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask";
import { ApplicantType } from "$models/Applicant";
import { JobApplication, Offer, Company, Applicant } from "$models";

describe("OfferTargetWhereClause", () => {
  it("returns an empty clause if model is Applicant", async () => {
    const whereClause = OfferTargetWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Applicant.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is JobApplication", async () => {
    const whereClause = OfferTargetWhereClause.build({
      secretary: Secretary.graduados,
      modelName: JobApplication.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Company", async () => {
    const whereClause = OfferTargetWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Company.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for offers targeted to students", async () => {
    const whereClause = OfferTargetWhereClause.build({
      secretary: Secretary.extension,
      modelName: Offer.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."targetApplicantType" = '${ApplicantType.both}' 
        OR "Offers"."targetApplicantType" = '${ApplicantType.student}'
      )
    `);
  });

  it("builds where clause for offers targeted to graduates", async () => {
    const whereClause = OfferTargetWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Offer.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."targetApplicantType" = '${ApplicantType.both}' 
        OR "Offers"."targetApplicantType" = '${ApplicantType.graduate}'
      )
    `);
  });
});
