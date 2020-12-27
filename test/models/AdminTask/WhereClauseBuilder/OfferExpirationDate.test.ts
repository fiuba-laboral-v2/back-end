import { OfferExpirationDateWhereClause } from "$models/AdminTask/WhereClauseBuilder/OfferExpirationDate";
import { Secretary } from "$models/Admin";
import { AdminTaskType } from "$models/AdminTask";
import { JobApplication, Offer, Company, Applicant } from "$models";
import MockDate from "mockdate";

describe("OfferExpirationDateWhereClause", () => {
  beforeEach(() => MockDate.reset());

  it("returns an empty clause if model is Applicant", async () => {
    const whereClause = OfferExpirationDateWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Applicant.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is JobApplication", async () => {
    const whereClause = OfferExpirationDateWhereClause.build({
      secretary: Secretary.graduados,
      modelName: JobApplication.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("returns an empty clause if model is Company", async () => {
    const whereClause = OfferExpirationDateWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Company.name as AdminTaskType
    });
    expect(whereClause).toBeUndefined();
  });

  it("builds where clause for non-expired offers for students", async () => {
    const date = `2020-12-04T16:57:07.333Z`;
    MockDate.set(new Date(date));
    const whereClause = OfferExpirationDateWhereClause.build({
      secretary: Secretary.extension,
      modelName: Offer.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."studentsExpirationDateTime" < '${date}' 
      )
    `);
  });

  it("builds where clause for non-expired offers for graduates", async () => {
    const date = `2020-12-04T16:57:07.333Z`;
    MockDate.set(new Date(date));
    const whereClause = OfferExpirationDateWhereClause.build({
      secretary: Secretary.graduados,
      modelName: Offer.name as AdminTaskType
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."graduatesExpirationDateTime" < '${date}' 
      )
    `);
  });
});
