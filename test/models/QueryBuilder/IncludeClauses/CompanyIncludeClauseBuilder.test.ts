import { CompanyIncludeClauseBuilder } from "$models/QueryBuilder";
import { Company } from "$models";
import { col, fn, Op, where } from "sequelize";

describe("CompanyIncludeClauseBuilder", () => {
  it("returns undefined if no companyName is provided and no businessSector are provided", () => {
    const clause = CompanyIncludeClauseBuilder.build({});
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the companyName is a newline character and no businessSector is provided", () => {
    const clause = CompanyIncludeClauseBuilder.build({ companyName: "\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the companyName is en empty string and no businessSector is provided", () => {
    const clause = CompanyIncludeClauseBuilder.build({ companyName: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the companyName is only spaces and no businessSector is provided", () => {
    const clause = CompanyIncludeClauseBuilder.build({ companyName: "     " });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the companyName is multiple new lines and no businessSector is provided", () => {
    const clause = CompanyIncludeClauseBuilder.build({ companyName: "\n\n\n\n\n\n\n\n\n\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the businessSector is a newline character and no companyName is provided", () => {
    const clause = CompanyIncludeClauseBuilder.build({ businessSector: "\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the businessSector is en empty string and no companyName is provided", () => {
    const clause = CompanyIncludeClauseBuilder.build({ businessSector: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the businessSector is only spaces and no companyName is provided", () => {
    const clause = CompanyIncludeClauseBuilder.build({ businessSector: "     " });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the businessSector is multiple new lines and no companyName is provided", () => {
    const clause = CompanyIncludeClauseBuilder.build({ businessSector: "\n\n\n\n\n\n\n\n\n\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the businessSector and the companyName are a newline character", () => {
    const clause = CompanyIncludeClauseBuilder.build({ businessSector: "\n", companyName: "\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the businessSector and the companyName are an empty string", () => {
    const clause = CompanyIncludeClauseBuilder.build({ businessSector: "", companyName: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the businessSector and the companyName are only spaces", () => {
    const clause = CompanyIncludeClauseBuilder.build({
      businessSector: "     ",
      companyName: "     "
    });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the businessSector and the companyName are have multiple new lines", () => {
    const clause = CompanyIncludeClauseBuilder.build({
      businessSector: "\n\n\n\n\n\n\n\n\n\n",
      companyName: "\n\n\n\n\n\n\n\n\n\n"
    });
    expect(clause).toBeUndefined();
  });

  it("returns a clause for a companyName with capitalize letters", () => {
    const companyName = "Mercado Libre";
    const clause = CompanyIncludeClauseBuilder.build({ companyName });
    expect(clause).toEqual({
      model: Company,
      where: {
        [Op.and]: [
          {
            [Op.and]: [
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("companyName"))), {
                    [Op.regexp]: `(^|[[:space:]])mercado([[:space:]]|$)`
                  })
                ]
              },
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("companyName"))), {
                    [Op.regexp]: `(^|[[:space:]])libre([[:space:]]|$)`
                  })
                ]
              }
            ]
          }
        ]
      },
      attributes: []
    });
  });

  it("returns a clause for a companyName with accents", () => {
    const companyName = "námé with áccent";
    const clause = CompanyIncludeClauseBuilder.build({ companyName });
    expect(clause).toEqual({
      model: Company,
      where: {
        [Op.and]: [
          {
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
          }
        ]
      },
      attributes: []
    });
  });

  it("returns a clause for a businessSector with accents and capital letter", () => {
    const businessSector = "Comprás y ventás";
    const clause = CompanyIncludeClauseBuilder.build({ businessSector });
    expect(clause).toEqual({
      model: Company,
      where: {
        [Op.and]: [
          {
            [Op.and]: [
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("businessSector"))), {
                    [Op.regexp]: `(^|[[:space:]])compras([[:space:]]|$)`
                  })
                ]
              },
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("businessSector"))), {
                    [Op.regexp]: `(^|[[:space:]])y([[:space:]]|$)`
                  })
                ]
              },
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("businessSector"))), {
                    [Op.regexp]: `(^|[[:space:]])ventas([[:space:]]|$)`
                  })
                ]
              }
            ]
          }
        ]
      },
      attributes: []
    });
  });

  it("returns a clause for a businessSector and companyName with accents and capital letter", () => {
    const businessSector = "Comprás y ventás";
    const companyName = "Mercadó Libŕe";
    const clause = CompanyIncludeClauseBuilder.build({ businessSector, companyName });
    expect(clause).toEqual({
      model: Company,
      where: {
        [Op.and]: [
          {
            [Op.and]: [
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("businessSector"))), {
                    [Op.regexp]: `(^|[[:space:]])compras([[:space:]]|$)`
                  })
                ]
              },
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("businessSector"))), {
                    [Op.regexp]: `(^|[[:space:]])y([[:space:]]|$)`
                  })
                ]
              },
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("businessSector"))), {
                    [Op.regexp]: `(^|[[:space:]])ventas([[:space:]]|$)`
                  })
                ]
              }
            ]
          },
          {
            [Op.and]: [
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("companyName"))), {
                    [Op.regexp]: `(^|[[:space:]])mercado([[:space:]]|$)`
                  })
                ]
              },
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("companyName"))), {
                    [Op.regexp]: `(^|[[:space:]])libre([[:space:]]|$)`
                  })
                ]
              }
            ]
          }
        ]
      },
      attributes: []
    });
  });
});
