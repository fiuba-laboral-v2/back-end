import { OfferWhereClauseBuilder } from "$models/QueryBuilder";
import { Offer } from "$models";
import { col, fn, Op, where } from "sequelize";

describe("OfferWhereClauseBuilder", () => {
  it("returns undefined if no name is provided", () => {
    const clause = OfferWhereClauseBuilder.build({});
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is a newline character", () => {
    const clause = OfferWhereClauseBuilder.build({ title: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is en empty array", () => {
    const clause = OfferWhereClauseBuilder.build({ title: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is only spaces", () => {
    const clause = OfferWhereClauseBuilder.build({ title: "     " });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is multiple new lines", () => {
    const clause = OfferWhereClauseBuilder.build({ title: "\n\n\n\n\n\n\n\n\n\n" });
    expect(clause).toBeUndefined();
  });

  it("returns a clause for a name with capitalize letters", () => {
    const title = "Buddy Guy";
    const clause = OfferWhereClauseBuilder.build({ title });
    expect(clause).toEqual({
      model: Offer,
      where: {
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
      },
      attributes: []
    });
  });

  it("returns a clause for a name with accents", () => {
    const title = "námé with áccent";
    const clause = OfferWhereClauseBuilder.build({ title });
    expect(clause).toEqual({
      model: Offer,
      where: {
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
      },
      attributes: []
    });
  });
});
