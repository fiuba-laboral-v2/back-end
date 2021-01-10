import { UsersIncludeClauseBuilder } from "$models/QueryBuilder";
import { UserSequelizeModel } from "$models";
import { col, fn, Op, where } from "sequelize";

describe("UsersIncludeClauseBuilder", () => {
  it("returns undefined if no name is provided", () => {
    const clause = UsersIncludeClauseBuilder.build({});
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is a newline character", () => {
    const clause = UsersIncludeClauseBuilder.build({ name: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is en empty array", () => {
    const clause = UsersIncludeClauseBuilder.build({ name: "" });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is only spaces", () => {
    const clause = UsersIncludeClauseBuilder.build({ name: "     " });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is multiple new lines", () => {
    const clause = UsersIncludeClauseBuilder.build({ name: "\n\n\n\n\n\n\n\n\n\n" });
    expect(clause).toBeUndefined();
  });

  it("returns a clause for a name with capitalize letters", () => {
    const name = "Buddy Guy";
    const clause = UsersIncludeClauseBuilder.build({ name });
    expect(clause).toEqual({
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
    });
  });

  it("returns a clause for a name with accents", () => {
    const name = "námé with áccent";
    const clause = UsersIncludeClauseBuilder.build({ name });
    expect(clause).toEqual({
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
    });
  });
});
