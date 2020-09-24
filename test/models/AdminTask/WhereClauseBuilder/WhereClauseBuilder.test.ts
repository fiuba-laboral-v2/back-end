import { WhereClauseBuilder } from "$models/AdminTask/WhereClauseBuilder";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { ApplicantType } from "$models/Applicant";
import { Applicant, ApplicantCareer, Offer } from "$models";
import { AdminTaskType } from "$models/AdminTask";

describe("WhereClauseBuilder", () => {
  it("builds where clause for pending offers targeted to graduates", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.graduados,
      adminTaskTypes: [AdminTaskType.Offer]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.pending}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
    `);
  });

  it("builds where clause for approved offers targeted to graduates", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.graduados,
      adminTaskTypes: [AdminTaskType.Offer]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
    `);
  });

  it("builds where clause for approved offers targeted to graduates", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      adminTaskTypes: [AdminTaskType.Offer]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."graduadosApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.graduate}'
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
    `);
  });

  it("builds where clause for pending offers targeted to students", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.extension,
      adminTaskTypes: [AdminTaskType.Offer]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
    `);
  });

  it("builds where clause for approved offers targeted to students", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.extension,
      adminTaskTypes: [AdminTaskType.Offer]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
    `);
  });

  it("builds where clause for rejected offers targeted to students", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.extension,
      adminTaskTypes: [AdminTaskType.Offer]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."targetApplicantType" = '${ApplicantType.both}' 
        OR "AdminTask"."targetApplicantType" = '${ApplicantType.student}'
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
    `);
  });

  it("builds where clause for all pending targeted to graduates", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.graduados,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
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
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for all approved targeted to graduates", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.graduados,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
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
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for all rejected targeted to graduates", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
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
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for all pending targeted to students", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.extension,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
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
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for all approved targeted to students", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.extension,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
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
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for all rejected targeted to students", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.extension,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
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
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for approved but not targeted tasks", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.graduados,
      adminTaskTypes: [AdminTaskType.Company, AdminTaskType.JobApplication]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
      )
    `);
  });

  it("builds all status where clause for shared status tasks for extension secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.JobApplication]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds all status where clause for shared status tasks for graduados secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      adminTaskTypes: [AdminTaskType.Applicant, AdminTaskType.Company, AdminTaskType.JobApplication]
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "AdminTask"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "AdminTask"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds all status where clause for graduados secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
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
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds all status where clause for extension secretary", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[]
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
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds updatedAt where clause", async () => {
    const updatedAt = new Date();
    const uuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      adminTaskTypes: Object.keys(AdminTaskType) as AdminTaskType[],
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
        OR "AdminTask"."tableNameColumn" != '${Offer.tableName}'
      )
      AND
      (
        "AdminTask"."tableNameColumn" != '${Applicant.tableName}'
        OR NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "AdminTask"."uuid" AND "isGraduate" = true
        )
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
