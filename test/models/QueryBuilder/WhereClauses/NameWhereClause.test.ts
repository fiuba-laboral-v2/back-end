import { NameWhereClause } from "$models/QueryBuilder";
import { col, fn, Op, where } from "sequelize";

describe("NameWhereClause", () => {
  const columnNames = ["name", "surname"];

  it("returns undefined if the name is a newline character", () => {
    const clause = NameWhereClause.build({ name: "\n", columnNames });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if columnNames is an empty array and name is an empty string", () => {
    const clause = NameWhereClause.build({ name: "", columnNames: [] });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is an empty string", () => {
    const clause = NameWhereClause.build({ name: "", columnNames });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if columnNames is an empty array", () => {
    const clause = NameWhereClause.build({ name: "name", columnNames: [] });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name is only spaces", () => {
    const clause = NameWhereClause.build({ name: "     ", columnNames });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name has multiple new lines", () => {
    const clause = NameWhereClause.build({ name: "\n\n\n\n\n\n\n\n\n\n", columnNames });
    expect(clause).toBeUndefined();
  });

  it("returns undefined if the name has multiple new lines with spaces", () => {
    const clause = NameWhereClause.build({ name: "\n\n\n\n\n \n \n\n\n\n    ", columnNames });
    expect(clause).toBeUndefined();
  });

  it("returns a clause for a name with capitalize letters", () => {
    const name = "Buddy Guy";
    const clause = NameWhereClause.build({ name, columnNames });
    expect(clause).toEqual({
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
    });
  });

  it("returns a clause for a name with accents", () => {
    const name = "námé with áccent";
    const clause = NameWhereClause.build({ name, columnNames });
    expect(clause).toEqual({
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
    });
  });

  it("returns a clause for a name with accents, spaces and newline characters", () => {
    const name = "\n\nnámé\n\n \n\n\n\nwith\n\n\n  \n áccent   \n\n\n\n  ";
    const clause = NameWhereClause.build({ name, columnNames });
    expect(clause).toEqual({
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
    });
  });

  it("returns a clause for a name for one columnName", () => {
    const name = "Buddy Guy";
    const clause = NameWhereClause.build({ name, columnNames: ["someColumnName"] });
    expect(clause).toEqual({
      [Op.and]: [
        {
          [Op.or]: [
            where(fn("unaccent", fn("lower", col("someColumnName"))), {
              [Op.regexp]: `(^|[[:space:]])buddy([[:space:]]|$)`
            })
          ]
        },
        {
          [Op.or]: [
            where(fn("unaccent", fn("lower", col("someColumnName"))), {
              [Op.regexp]: `(^|[[:space:]])guy([[:space:]]|$)`
            })
          ]
        }
      ]
    });
  });
});
