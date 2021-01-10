import { OfferTitleWhereClauseBuilder } from "$models/QueryBuilder";
import { col, fn, Op, where } from "sequelize";

describe("OfferTitleWhereClauseBuilder", () => {
  it("returns undefined if no title", () => {
    const clause = OfferTitleWhereClauseBuilder.build({});
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title is a newline character", () => {
    const clause = OfferTitleWhereClauseBuilder.build({ title: "\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title is en empty string", () => {
    const clause = OfferTitleWhereClauseBuilder.build({ title: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title is only spaces", () => {
    const clause = OfferTitleWhereClauseBuilder.build({ title: "     " });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name has multiple new lines", () => {
    const clause = OfferTitleWhereClauseBuilder.build({ title: "\n\n\n\n\n\n\n\n\n\n" });
    expect(clause).toBeUndefined();
  });

  it("returns a clause for a title with capitalize letters", () => {
    const title = "Buddy Guy";
    const clause = OfferTitleWhereClauseBuilder.build({ title });
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
    const clause = OfferTitleWhereClauseBuilder.build({ title });
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
});
