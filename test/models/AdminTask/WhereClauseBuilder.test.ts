import { WhereClauseBuilder } from "$models/AdminTask/WhereClauseBuilder";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";

describe("WhereClauseBuilder", () => {
  it("builds approved status where clause for graduados secretary", async () => {
    const whereClause = WhereClauseBuilder.build([ApprovalStatus.approved], Secretary.graduados, {
      includesSeparateApprovalModel: true,
      includesSharedApprovalModel: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
      )
    `);
  });

  it("builds pending status where clause for graduados secretary", async () => {
    const whereClause = WhereClauseBuilder.build([ApprovalStatus.pending], Secretary.graduados, {
      includesSeparateApprovalModel: true,
      includesSharedApprovalModel: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.pending}'
      )
    `);
  });

  it("builds rejected status where clause for graduados secretary", async () => {
    const whereClause = WhereClauseBuilder.build([ApprovalStatus.rejected], Secretary.graduados, {
      includesSeparateApprovalModel: true,
      includesSharedApprovalModel: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds approved status where clause for extension secretary", async () => {
    const whereClause = WhereClauseBuilder.build([ApprovalStatus.approved], Secretary.extension, {
      includesSeparateApprovalModel: true,
      includesSharedApprovalModel: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
      )
    `);
  });

  it("builds pending status where clause for extension secretary", async () => {
    const whereClause = WhereClauseBuilder.build([ApprovalStatus.pending], Secretary.extension, {
      includesSeparateApprovalModel: true,
      includesSharedApprovalModel: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
      )
    `);
  });

  it("builds rejected status where clause for extension secretary", async () => {
    const whereClause = WhereClauseBuilder.build([ApprovalStatus.rejected], Secretary.extension, {
      includesSeparateApprovalModel: true,
      includesSharedApprovalModel: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds all status where clause for SharedApprovalModels", async () => {
    const whereClause = WhereClauseBuilder.build(
      [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      Secretary.extension,
      { includesSeparateApprovalModel: false, includesSharedApprovalModel: true }
    );
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds all status where clause for extension secretary", async () => {
    const whereClause = WhereClauseBuilder.build(
      [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      Secretary.extension,
      { includesSeparateApprovalModel: true, includesSharedApprovalModel: false }
    );
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds all status where clause for graduados secretary", async () => {
    const whereClause = WhereClauseBuilder.build(
      [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      Secretary.graduados,
      { includesSeparateApprovalModel: true, includesSharedApprovalModel: false }
    );
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds all status where clause for graduados secretary and includesSharedApprovalModels", async () => {
    const whereClause = WhereClauseBuilder.build(
      [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      Secretary.graduados,
      { includesSeparateApprovalModel: true, includesSharedApprovalModel: true }
    );
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds all status where clause for extension secretary and includesSharedApprovalModels", async () => {
    const whereClause = WhereClauseBuilder.build(
      [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      Secretary.extension,
      { includesSeparateApprovalModel: true, includesSharedApprovalModel: true }
    );
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds with updatedAt where clause", async () => {
    const updatedAt = new Date();
    const uuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const whereClause = WhereClauseBuilder.build(
      [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      Secretary.extension,
      { includesSeparateApprovalModel: true, includesSharedApprovalModel: true },
      { uuid, dateTime: updatedAt }
    );

    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND (
        (
          "AdminTask"."updatedAt" < '${updatedAt.toISOString()}'
        ) OR (
          "AdminTask"."updatedAt" = '${updatedAt.toISOString()}'
          AND "AdminTask"."uuid" < '${uuid}'
        )
      )
    `);
  });
});
