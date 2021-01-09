import { CompanyWhereClauseBuilder } from "$models/QueryBuilder";
import { Company } from "$models";
import { col, fn, Op, where } from "sequelize";

describe("CompanyWhereClauseBuilder", () => {
  it("returns undefined if no name is provided", () => {
    const clause = CompanyWhereClauseBuilder.build({});
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the companyName is a newline character", () => {
    const clause = CompanyWhereClauseBuilder.build({ companyName: "\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the companyName is en empty string", () => {
    const clause = CompanyWhereClauseBuilder.build({ companyName: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the companyName is only spaces", () => {
    const clause = CompanyWhereClauseBuilder.build({ companyName: "     " });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the companyName is multiple new lines", () => {
    const clause = CompanyWhereClauseBuilder.build({ companyName: "\n\n\n\n\n\n\n\n\n\n" });
    expect(clause).toBeUndefined();
  });

  it("returns a clause for a companyName with capitalize letters", () => {
    const companyName = "Buddy Guy";
    const clause = CompanyWhereClauseBuilder.build({ companyName });
    expect(clause).toEqual({
      model: Company,
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              where(fn("unaccent", fn("lower", col("companyName"))), {
                [Op.regexp]: `(^|[[:space:]])buddy([[:space:]]|$)`
              })
            ]
          },
          {
            [Op.or]: [
              where(fn("unaccent", fn("lower", col("companyName"))), {
                [Op.regexp]: `(^|[[:space:]])guy([[:space:]]|$)`
              })
            ]
          }
        ]
      },
      attributes: []
    });
  });

  it("returns a clause for a companyName with accents", () => {
    const companyName = "námé with áccent";
    const clause = CompanyWhereClauseBuilder.build({ companyName });
    expect(clause).toEqual({
      model: Company,
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              where(fn("unaccent", fn("lower", col("companyName"))), {
                [Op.regexp]: `(^|[[:space:]])name([[:space:]]|$)`
              })
            ]
          },
          {
            [Op.or]: [
              where(fn("unaccent", fn("lower", col("companyName"))), {
                [Op.regexp]: `(^|[[:space:]])with([[:space:]]|$)`
              })
            ]
          },
          {
            [Op.or]: [
              where(fn("unaccent", fn("lower", col("companyName"))), {
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
