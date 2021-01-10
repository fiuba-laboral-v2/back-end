import { OfferIncludeClauseBuilder } from "$models/QueryBuilder";
import { Company, Offer } from "$models";
import { col, fn, Op, where } from "sequelize";

describe("OfferIncludeClauseBuilder", () => {
  it("returns undefined if no title and companyName are provided", () => {
    const clause = OfferIncludeClauseBuilder.build({});
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title is a newline character and no companyName is provided", () => {
    const clause = OfferIncludeClauseBuilder.build({ title: "\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title is en empty string and no companyName is provided", () => {
    const clause = OfferIncludeClauseBuilder.build({ title: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title is only spaces and no companyName is provided", () => {
    const clause = OfferIncludeClauseBuilder.build({ title: "     " });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name has multiple new lines and no companyName is provided", () => {
    const clause = OfferIncludeClauseBuilder.build({ title: "\n\n\n\n\n\n\n\n\n\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the companyName and the title are a newline character", () => {
    const clause = OfferIncludeClauseBuilder.build({ title: "\n", companyName: "\n" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title and the companyName are only spaces", () => {
    const clause = OfferIncludeClauseBuilder.build({ title: "     ", companyName: "     " });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the title and the companyName has multiple new lines and no companyName is provided", () => {
    const multipleNewLines = "\n\n\n\n\n\n\n\n\n\n";
    const clause = OfferIncludeClauseBuilder.build({
      title: multipleNewLines,
      companyName: multipleNewLines
    });
    expect(clause).toBeUndefined();
  });

  it("returns a clause for a title with capitalize letters", () => {
    const title = "Buddy Guy";
    const clause = OfferIncludeClauseBuilder.build({ title });
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

  it("returns a clause for a title with accents", () => {
    const title = "námé with áccent";
    const clause = OfferIncludeClauseBuilder.build({ title });
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

  it("returns a clause for an offer title and a company name", () => {
    const title = "Desarrollador Java";
    const companyName = "Devartis";
    const clause = OfferIncludeClauseBuilder.build({ title, companyName });
    expect(clause).toEqual({
      model: Offer,
      where: {
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
      include: [
        {
          model: Company,
          where: {
            [Op.and]: [
              {
                [Op.and]: [
                  {
                    [Op.or]: [
                      where(fn("unaccent", fn("lower", col("companyName"))), {
                        [Op.regexp]: `(^|[[:space:]])devartis([[:space:]]|$)`
                      })
                    ]
                  }
                ]
              }
            ]
          },
          attributes: []
        }
      ],
      required: true,
      attributes: []
    });
  });

  it("returns a clause for a company name", () => {
    const companyName = "Mercado Libre";
    const clause = OfferIncludeClauseBuilder.build({ companyName });
    expect(clause).toEqual({
      model: Offer,
      include: [
        {
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
        }
      ],
      required: true,
      attributes: []
    });
  });
});
