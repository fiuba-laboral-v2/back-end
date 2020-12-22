import { UpdatedAtWhereClause } from "$models/AdminTask/WhereClauseBuilder/UpdatedAt";
import { Company, Offer, JobApplication, Applicant } from "$models";

describe("UpdatedAtWhereClause", () => {
  it("builds updatedAt where clause", async () => {
    const updatedAt = new Date();
    const uuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    [Company, Offer, JobApplication, Applicant].forEach(model => {
      const whereClause = UpdatedAtWhereClause.build({
        updatedBeforeThan: { uuid, dateTime: updatedAt },
        tableName: model.tableName
      });
      expect(whereClause).toEqualIgnoringSpacing(`
      (
        ("${model.tableName}"."updatedAt" < '${updatedAt.toISOString()}')
        OR (
          "${model.tableName}"."updatedAt" = '${updatedAt.toISOString()}'
          AND "${model.tableName}"."uuid" < '${uuid}'
        )
      )
    `);
    });
  });
});
