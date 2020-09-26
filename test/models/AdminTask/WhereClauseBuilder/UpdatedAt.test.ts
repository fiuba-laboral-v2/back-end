import { UpdatedAtWhereClause } from "$models/AdminTask/WhereClauseBuilder/UpdatedAt";

describe("UpdatedAtWhereClause", () => {
  it("builds updatedAt where clause", async () => {
    const updatedAt = new Date();
    const uuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const whereClause = UpdatedAtWhereClause.build({ uuid, dateTime: updatedAt });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        ("AdminTask"."updatedAt" < '${updatedAt.toISOString()}')
        OR (
          "AdminTask"."updatedAt" = '${updatedAt.toISOString()}'
          AND "AdminTask"."uuid" < '${uuid}'
        )
      )
    `);
  });
});
