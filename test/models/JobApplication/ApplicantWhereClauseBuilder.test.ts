import { ApplicantWhereClauseBuilder } from "$models/JobApplication/ApplicantWhereClauseBuilder";
import { Applicant, UserSequelizeModel } from "$models";
import { col, fn, Op, where } from "sequelize";

describe("ApplicantWhereClauseBuilder", () => {
  it("returns undefined if no name is provided", () => {
    const clause = ApplicantWhereClauseBuilder.build({});
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is a newline character", () => {
    const clause = ApplicantWhereClauseBuilder.build({ applicantName: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is en empty array", () => {
    const clause = ApplicantWhereClauseBuilder.build({ applicantName: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is only spaces", () => {
    const clause = ApplicantWhereClauseBuilder.build({ applicantName: "     " });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is multiple new lines", () => {
    const clause = ApplicantWhereClauseBuilder.build({ applicantName: "\n\n\n\n\n\n\n\n\n\n" });
    expect(clause).toBeUndefined();
  });

  it("returns a clause for a name with capitalize letters", () => {
    const applicantName = "Buddy Guy";
    const clause = ApplicantWhereClauseBuilder.build({ applicantName });
    expect(clause).toEqual({
      model: Applicant,
      include: [
        {
          model: UserSequelizeModel,
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("name"))), {
                    [Op.regexp]: `(^|[[:space:]])buddy([[:space:]]|$)`
                  }),
                  where(fn("unaccent", fn("lower", col("surname"))), {
                    [Op.regexp]: `(^|[[:space:]])buddy([[:space:]]|$)`
                  })
                ]
              },
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("name"))), {
                    [Op.regexp]: `(^|[[:space:]])guy([[:space:]]|$)`
                  }),
                  where(fn("unaccent", fn("lower", col("surname"))), {
                    [Op.regexp]: `(^|[[:space:]])guy([[:space:]]|$)`
                  })
                ]
              }
            ]
          },
          attributes: []
        }
      ],
      attributes: []
    });
  });

  it("returns a clause for a name with accents", () => {
    const applicantName = "námé with áccent";
    const clause = ApplicantWhereClauseBuilder.build({ applicantName });
    expect(clause).toEqual({
      model: Applicant,
      include: [
        {
          model: UserSequelizeModel,
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("name"))), {
                    [Op.regexp]: `(^|[[:space:]])name([[:space:]]|$)`
                  }),
                  where(fn("unaccent", fn("lower", col("surname"))), {
                    [Op.regexp]: `(^|[[:space:]])name([[:space:]]|$)`
                  })
                ]
              },
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("name"))), {
                    [Op.regexp]: `(^|[[:space:]])with([[:space:]]|$)`
                  }),
                  where(fn("unaccent", fn("lower", col("surname"))), {
                    [Op.regexp]: `(^|[[:space:]])with([[:space:]]|$)`
                  })
                ]
              },
              {
                [Op.or]: [
                  where(fn("unaccent", fn("lower", col("name"))), {
                    [Op.regexp]: `(^|[[:space:]])accent([[:space:]]|$)`
                  }),
                  where(fn("unaccent", fn("lower", col("surname"))), {
                    [Op.regexp]: `(^|[[:space:]])accent([[:space:]]|$)`
                  })
                ]
              }
            ]
          },
          attributes: []
        }
      ],
      attributes: []
    });
  });
});
