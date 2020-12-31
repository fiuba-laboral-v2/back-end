import { WhereClauseBuilder } from "$models/AdminTask/WhereClauseBuilder";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";
import { ApplicantType } from "$models/Applicant";
import { Applicant, ApplicantCareer, JobApplication, Offer, Company } from "$models";
import { AdminTaskType } from "$models/AdminTask";
import MockDate from "mockdate";

describe("WhereClauseBuilder", () => {
  const date = `2020-12-04T16:57:07.333Z`;

  beforeEach(() => {
    MockDate.reset();
    MockDate.set(new Date(date));
  });

  it("builds where clause for pending offers targeted to graduates", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.graduados,
      modelName: AdminTaskType.Offer,
      tableName: Offer.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."graduadosApprovalStatus" = '${ApprovalStatus.pending}'
      )
      AND
      (
        "Offers"."targetApplicantType" = '${ApplicantType.both}' 
        OR "Offers"."targetApplicantType" = '${ApplicantType.graduate}'
      )
      AND
      (
        NOT
        (
          "Offers"."graduatesExpirationDateTime" < '${date}'
          AND
          "Offers"."graduadosApprovalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Companies"
          WHERE "Offers"."companyUuid" = "Companies"."uuid"
          AND "Companies"."approvalStatus" = 'approved'
        )
      )
   `);
  });

  it("builds where clause for approved offers targeted to graduates", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.graduados,
      modelName: AdminTaskType.Offer,
      tableName: Offer.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."graduadosApprovalStatus" = 'approved'
      )
      AND
      (
        "Offers"."targetApplicantType" = 'both' 
        OR "Offers"."targetApplicantType" = 'graduate'
      )
      AND
      (
        NOT
        (
          "Offers"."graduatesExpirationDateTime" < '${date}'
          AND
          "Offers"."graduadosApprovalStatus" = 'approved'
        )
      ) 
      AND
      (
        EXISTS (
          SELECT *
          FROM "Companies"
          WHERE "Offers"."companyUuid" = "Companies"."uuid"
          AND "Companies"."approvalStatus" = 'approved'
        )
      )
    `);
  });

  it("builds where clause for pending offers targeted to students", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.extension,
      modelName: AdminTaskType.Offer,
      tableName: Offer.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
      )
      AND
      (
        "Offers"."targetApplicantType" = '${ApplicantType.both}' 
        OR "Offers"."targetApplicantType" = '${ApplicantType.student}'
      )
      AND
      (
        NOT
        (
          "Offers"."studentsExpirationDateTime" < '${date}'
          AND
          "Offers"."extensionApprovalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Companies"
          WHERE "Offers"."companyUuid" = "Companies"."uuid"
          AND "Companies"."approvalStatus" = 'approved'
        )
      )
    `);
  });

  it("builds where clause for approved offers targeted to students", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.extension,
      modelName: AdminTaskType.Offer,
      tableName: Offer.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
      )
      AND
      (
        "Offers"."targetApplicantType" = '${ApplicantType.both}' 
        OR "Offers"."targetApplicantType" = '${ApplicantType.student}'
      )
      AND
      (
        NOT
        (
          "Offers"."studentsExpirationDateTime" < '${date}'
          AND
          "Offers"."extensionApprovalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Companies"
          WHERE "Offers"."companyUuid" = "Companies"."uuid"
          AND "Companies"."approvalStatus" = 'approved'
        )
      )
    `);
  });

  it("builds where clause for rejected offers targeted to students", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.extension,
      modelName: AdminTaskType.Offer,
      tableName: Offer.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "Offers"."targetApplicantType" = '${ApplicantType.both}' 
        OR "Offers"."targetApplicantType" = '${ApplicantType.student}'
      )
      AND
      (
        NOT
        (
          "Offers"."studentsExpirationDateTime" < '${date}'
          AND
          "Offers"."extensionApprovalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Companies"
          WHERE "Offers"."companyUuid" = "Companies"."uuid"
          AND "Companies"."approvalStatus" = 'approved'
        )
      )
    `);
  });

  it("builds where clause for pending Applicants for a graduados admin", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.graduados,
      modelName: AdminTaskType.Applicant,
      tableName: Applicant.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Applicants"."approvalStatus" = '${ApprovalStatus.pending}'
      )
      AND
      (
        EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "Applicants"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for rejected Companies for a graduados admin", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      modelName: AdminTaskType.Company,
      tableName: Company.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Companies"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds where clause for pending Companies for an extension admin", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.extension,
      modelName: AdminTaskType.Company,
      tableName: Company.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Companies"."approvalStatus" = '${ApprovalStatus.pending}'
      )
    `);
  });

  it("builds where clause for approved JobApplications for a graduados admin", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.extension,
      modelName: AdminTaskType.JobApplication,
      tableName: JobApplication.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "JobApplications"."approvalStatus" = '${ApprovalStatus.approved}'
      )
      AND
      (
        NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "JobApplications"."applicantUuid" AND "isGraduate" = true
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Applicants"
          WHERE "JobApplications"."applicantUuid" = "Applicants"."uuid"
          AND "Applicants"."approvalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Offers"
          WHERE "JobApplications"."offerUuid" = "Offers"."uuid"
          AND "Offers"."extensionApprovalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Offers"
          WHERE "JobApplications"."offerUuid" = "Offers"."uuid"
          AND EXISTS (
            SELECT *
            FROM "Companies"
            WHERE "Offers"."companyUuid" = "Companies"."uuid"
            AND "Companies"."approvalStatus" = 'approved'
          )
        )
      )
    `);
  });

  it("builds where clause for rejected Applicants for an extension admin", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.extension,
      modelName: AdminTaskType.Applicant,
      tableName: Applicant.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Applicants"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "Applicants"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for approved Companies", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.graduados,
      modelName: AdminTaskType.Company,
      tableName: Company.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Companies"."approvalStatus" = '${ApprovalStatus.approved}'
      )
    `);
  });

  it("builds where clause for all status JobApplications for an extension admin", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      modelName: AdminTaskType.JobApplication,
      tableName: JobApplication.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "JobApplications"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "JobApplications"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "JobApplications"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        NOT EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "JobApplications"."applicantUuid" AND "isGraduate" = true
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Applicants"
          WHERE "JobApplications"."applicantUuid" = "Applicants"."uuid"
          AND "Applicants"."approvalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Offers"
          WHERE "JobApplications"."offerUuid" = "Offers"."uuid"
          AND "Offers"."extensionApprovalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Offers"
          WHERE "JobApplications"."offerUuid" = "Offers"."uuid"
          AND EXISTS (
            SELECT *
            FROM "Companies"
            WHERE "Offers"."companyUuid" = "Companies"."uuid"
            AND "Companies"."approvalStatus" = 'approved'
          )
        )
      )
    `);
  });

  it("builds where clause for all status JobApplications for an graduados admin", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      modelName: AdminTaskType.JobApplication,
      tableName: JobApplication.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "JobApplications"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "JobApplications"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "JobApplications"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "JobApplications"."applicantUuid" AND "isGraduate" = true
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Applicants"
          WHERE "JobApplications"."applicantUuid" = "Applicants"."uuid"
          AND "Applicants"."approvalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Offers"
          WHERE "JobApplications"."offerUuid" = "Offers"."uuid"
          AND "Offers"."graduadosApprovalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Offers"
          WHERE "JobApplications"."offerUuid" = "Offers"."uuid"
          AND EXISTS (
            SELECT *
            FROM "Companies"
            WHERE "Offers"."companyUuid" = "Companies"."uuid"
            AND "Companies"."approvalStatus" = 'approved'
          )
        )
      )
    `);
  });

  it("builds where clause for all status Applicants for a graduados admin", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      modelName: AdminTaskType.Applicant,
      tableName: Applicant.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Applicants"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "Applicants"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "Applicants"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        EXISTS(
          SELECT *
          FROM "${ApplicantCareer.tableName}"
          WHERE "applicantUuid" = "Applicants"."uuid" AND "isGraduate" = true
        )
      )
    `);
  });

  it("builds where clause for all status Companies for a graduados admin", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      modelName: AdminTaskType.Company,
      tableName: Company.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Companies"."approvalStatus" = '${ApprovalStatus.pending}'
        OR "Companies"."approvalStatus" = '${ApprovalStatus.approved}'
        OR "Companies"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds where clause for all status Offers for a graduados admin", () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      modelName: AdminTaskType.Offer,
      tableName: Offer.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
        OR "Offers"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
        OR "Offers"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "Offers"."targetApplicantType" = '${ApplicantType.both}' 
        OR "Offers"."targetApplicantType" = '${ApplicantType.student}'
      )
      AND
      (
        NOT
        (
          "Offers"."studentsExpirationDateTime" < '${date}'
          AND
          "Offers"."extensionApprovalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Companies"
          WHERE "Offers"."companyUuid" = "Companies"."uuid"
          AND "Companies"."approvalStatus" = 'approved'
        )
      )
    `);
  });

  it("builds updatedAt where clause for Offers", () => {
    const updatedAt = new Date();
    const uuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      modelName: AdminTaskType.Offer,
      tableName: Offer.tableName,
      updatedBeforeThan: { uuid, dateTime: updatedAt }
    });

    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."extensionApprovalStatus" = '${ApprovalStatus.pending}'
        OR "Offers"."extensionApprovalStatus" = '${ApprovalStatus.approved}'
        OR "Offers"."extensionApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "Offers"."targetApplicantType" = '${ApplicantType.both}' 
        OR "Offers"."targetApplicantType" = '${ApplicantType.student}'
      )
      AND
      (
        NOT
        (
          "Offers"."studentsExpirationDateTime" < '${date}'
          AND
          "Offers"."extensionApprovalStatus" = 'approved'
        )
      )
      AND
      (
        EXISTS (
          SELECT *
          FROM "Companies"
          WHERE "Offers"."companyUuid" = "Companies"."uuid"
          AND "Companies"."approvalStatus" = 'approved'
        )
      )
      AND
      (
        (
          "Offers"."updatedAt" < '${updatedAt.toISOString()}'
        ) OR (
          "Offers"."updatedAt" = '${updatedAt.toISOString()}'
          AND "Offers"."uuid" < '${uuid}'
        )
      )
    `);
  });
});
