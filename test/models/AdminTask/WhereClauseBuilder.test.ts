import { WhereClauseBuilder } from "$models/AdminTask/WhereClauseBuilder";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { ApplicantType } from "$models/Offer";

describe("WhereClauseBuilder", () => {
  it("builds pending status where clause for graduados secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.graduados,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: true
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.pending}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds approved status where clause for graduados secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.graduados,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: true
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds where clause for not targeted tasks", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.graduados,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: true
      },
      isTargeted: false
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
      )
    `);
  });

  it("builds rejected status where clause for graduados secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: true
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds approved status where clause for extension secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.extension,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: true
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds pending status where clause for extension secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.extension,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: true
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds rejected status where clause for extension secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.extension,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: true
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds all status where clause for SharedApprovalModels", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      approvalStatusOptions: {
        includesSeparateApprovalModel: false,
        includesSharedApprovalModel: true
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds all status where clause for extension secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: false
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds all status where clause for graduados secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: false
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds all status where clause for graduados secretary and includesSharedApprovalModels", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: true
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds all status where clause for extension secretary and includesSharedApprovalModels", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: true
      },
      isTargeted: true
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."targetApplicantType" IS NULL
      )
    `);
  });

  it("builds with updatedAt where clause", async () => {
    const updatedAt = new Date();
    const uuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      approvalStatusOptions: {
        includesSeparateApprovalModel: true,
        includesSharedApprovalModel: true
      },
      isTargeted: true,
      updatedBeforeThan: { uuid, dateTime: updatedAt }
    });

    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."targetApplicantType" IS NULL
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
