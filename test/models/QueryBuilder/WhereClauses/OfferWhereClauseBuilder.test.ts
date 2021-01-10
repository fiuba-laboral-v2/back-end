import { OfferWhereClauseBuilder } from "$models/QueryBuilder";
import { col, fn, Op, where } from "sequelize";
import { ApprovalStatus } from "$models/ApprovalStatus";

describe("OfferWhereClauseBuilder", () => {
  it("returns undefined if no title and approvalStatus are provided", () => {
    const clause = OfferWhereClauseBuilder.build({});
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title is a newline character and no approvalStatus is provided", () => {
    const clause = OfferWhereClauseBuilder.build({ title: "\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title is en empty string and no approvalStatus is provided", () => {
    const clause = OfferWhereClauseBuilder.build({ title: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title is only spaces and no approvalStatus is provided", () => {
    const clause = OfferWhereClauseBuilder.build({ title: "     " });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name has multiple new lines and no approvalStatus is provided", () => {
    const clause = OfferWhereClauseBuilder.build({ title: "\n\n\n\n\n\n\n\n\n\n" });
    expect(clause).toBeUndefined();
  });

  it("returns a clause for a title with capitalize letters", () => {
    const title = "Buddy Guy";
    const clause = OfferWhereClauseBuilder.build({ title });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            {
              [Op.or]: [
                where(fn("unaccent", fn("lower", col("title"))), {
                  [Op.regexp]: `(^|[[:space:]])buddy([[:space:]]|$)`
                })
              ]
            },
            {
              [Op.or]: [
                where(fn("unaccent", fn("lower", col("title"))), {
                  [Op.regexp]: `(^|[[:space:]])guy([[:space:]]|$)`
                })
              ]
            }
          ]
        }
      ]
    });
  });

  it("returns a clause for a title with accents", () => {
    const title = "námé with áccent";
    const clause = OfferWhereClauseBuilder.build({ title });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            {
              [Op.or]: [
                where(fn("unaccent", fn("lower", col("title"))), {
                  [Op.regexp]: `(^|[[:space:]])name([[:space:]]|$)`
                })
              ]
            },
            {
              [Op.or]: [
                where(fn("unaccent", fn("lower", col("title"))), {
                  [Op.regexp]: `(^|[[:space:]])with([[:space:]]|$)`
                })
              ]
            },
            {
              [Op.or]: [
                where(fn("unaccent", fn("lower", col("title"))), {
                  [Op.regexp]: `(^|[[:space:]])accent([[:space:]]|$)`
                })
              ]
            }
          ]
        }
      ]
    });
  });

  it("returns a clause for an offer title and approvalStatus", () => {
    const title = "Desarrollador Java";
    const approvalStatus = ApprovalStatus.pending;
    const clause = OfferWhereClauseBuilder.build({ title, approvalStatus });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.and]: [
            {
              [Op.or]: [
                where(fn("unaccent", fn("lower", col("title"))), {
                  [Op.regexp]: `(^|[[:space:]])desarrollador([[:space:]]|$)`
                })
              ]
            },
            {
              [Op.or]: [
                where(fn("unaccent", fn("lower", col("title"))), {
                  [Op.regexp]: `(^|[[:space:]])java([[:space:]]|$)`
                })
              ]
            }
          ]
        },
        { approvalStatus }
      ]
    });
  });

  it("returns a clause for approvalStatus", () => {
    const approvalStatus = ApprovalStatus.rejected;
    const clause = OfferWhereClauseBuilder.build({ approvalStatus });
    expect(clause).toEqual({ [Op.and]: [{ approvalStatus }] });
  });
});
