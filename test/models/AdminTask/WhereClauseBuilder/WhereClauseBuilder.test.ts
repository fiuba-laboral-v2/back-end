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

  it("builds where clause for pending offers targeted to graduates", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.graduados,
      modelName: Offer.name as AdminTaskType,
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
        "Offers"."graduatesExpirationDateTime" > '${date}'
        OR
        (
          "Offers"."graduatesExpirationDateTime" IS NULL
          AND
          (
            "Offers"."graduadosApprovalStatus" = 'pending'
            OR
            "Offers"."graduadosApprovalStatus" = 'rejected'
          )
        )
      ) 
    `);
  });

  it("builds where clause for approved offers targeted to graduates", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.graduados,
      modelName: Offer.name as AdminTaskType,
      tableName: Offer.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."graduadosApprovalStatus" = '${ApprovalStatus.approved}'
      )
      AND
      (
        "Offers"."targetApplicantType" = '${ApplicantType.both}' 
        OR "Offers"."targetApplicantType" = '${ApplicantType.graduate}'
      )
      AND
      (
        "Offers"."graduatesExpirationDateTime" > '${date}'
        OR
        (
          "Offers"."graduatesExpirationDateTime" IS NULL
          AND
          (
            "Offers"."graduadosApprovalStatus" = 'pending'
            OR
            "Offers"."graduadosApprovalStatus" = 'rejected'
          )
        )
      ) 
    `);
  });

  it("builds where clause for approved offers targeted to graduates", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      modelName: Offer.name as AdminTaskType,
      tableName: Offer.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Offers"."graduadosApprovalStatus" = '${ApprovalStatus.rejected}'
      )
      AND
      (
        "Offers"."targetApplicantType" = '${ApplicantType.both}' 
        OR "Offers"."targetApplicantType" = '${ApplicantType.graduate}'
      )
      AND
      (
        "Offers"."graduatesExpirationDateTime" > '${date}'
        OR
        (
          "Offers"."graduatesExpirationDateTime" IS NULL
          AND
          (
            "Offers"."graduadosApprovalStatus" = 'pending'
            OR
            "Offers"."graduadosApprovalStatus" = 'rejected'
          )
        )
      ) 
    `);
  });

  it("builds where clause for pending offers targeted to students", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.extension,
      modelName: Offer.name as AdminTaskType,
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
        "Offers"."studentsExpirationDateTime" > '${date}'
        OR
        (
          "Offers"."studentsExpirationDateTime" IS NULL
          AND
          (
            "Offers"."extensionApprovalStatus" = 'pending'
            OR
            "Offers"."extensionApprovalStatus" = 'rejected'
          )
        )
      ) 
    `);
  });

  it("builds where clause for approved offers targeted to students", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.extension,
      modelName: Offer.name as AdminTaskType,
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

        "Offers"."studentsExpirationDateTime" > '${date}'
        OR
        (
          "Offers"."studentsExpirationDateTime" IS NULL
          AND
          (
            "Offers"."extensionApprovalStatus" = 'pending'
            OR
            "Offers"."extensionApprovalStatus" = 'rejected'
          )
        )
      ) 
    `);
  });

  it("builds where clause for rejected offers targeted to students", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.extension,
      modelName: Offer.name as AdminTaskType,
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
        "Offers"."studentsExpirationDateTime" > '${date}'
        OR
        (
          "Offers"."studentsExpirationDateTime" IS NULL
          AND
          (
            "Offers"."extensionApprovalStatus" = 'pending'
            OR
            "Offers"."extensionApprovalStatus" = 'rejected'
          )
        )
      ) 
    `);
  });

  it("builds where clause for pending Applicants for a graduados admin", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.graduados,
      modelName: Applicant.name as AdminTaskType,
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

  it("builds where clause for rejected Companies for a graduados admin", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      modelName: Company.name as AdminTaskType,
      tableName: Company.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Companies"."approvalStatus" = '${ApprovalStatus.rejected}'
      )
    `);
  });

  it("builds where clause for pending Companies for an extension admin", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending],
      secretary: Secretary.extension,
      modelName: Company.name as AdminTaskType,
      tableName: Company.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Companies"."approvalStatus" = '${ApprovalStatus.pending}'
      )
    `);
  });

  it("builds where clause for approved JobApplications for a graduados admin", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.extension,
      modelName: JobApplication.name as AdminTaskType,
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
    `);
  });

  it("builds where clause for rejected Applicants for an extension admin", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.rejected],
      secretary: Secretary.extension,
      modelName: Applicant.name as AdminTaskType,
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

  it("builds where clause for approved Companies", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.approved],
      secretary: Secretary.graduados,
      modelName: Company.name as AdminTaskType,
      tableName: Company.tableName
    });
    expect(whereClause).toEqualIgnoringSpacing(`
      (
        "Companies"."approvalStatus" = '${ApprovalStatus.approved}'
      )
    `);
  });

  it("builds where clause for all status JobApplications for an extension admin", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      modelName: JobApplication.name as AdminTaskType,
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
    `);
  });

  it("builds where clause for all status Applicants for a graduados admin", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      modelName: Applicant.name as AdminTaskType,
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

  it("builds where clause for all status Companies for a graduados admin", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.graduados,
      modelName: Company.name as AdminTaskType,
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

  it("builds where clause for all status Offers for a graduados admin", async () => {
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      modelName: Offer.name as AdminTaskType,
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
        "Offers"."studentsExpirationDateTime" > '${date}'
        OR
        (
          "Offers"."studentsExpirationDateTime" IS NULL
          AND
          (
            "Offers"."extensionApprovalStatus" = 'pending'
            OR
            "Offers"."extensionApprovalStatus" = 'rejected'
          )
        )
      )
    `);
  });

  it("builds updatedAt where clause for Offers", async () => {
    const updatedAt = new Date();
    const uuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
    const whereClause = WhereClauseBuilder.build({
      statuses: [ApprovalStatus.pending, ApprovalStatus.approved, ApprovalStatus.rejected],
      secretary: Secretary.extension,
      modelName: Offer.name as AdminTaskType,
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
        "Offers"."studentsExpirationDateTime" > '${date}'
        OR
        (
          "Offers"."studentsExpirationDateTime" IS NULL
          AND
          (
            "Offers"."extensionApprovalStatus" = 'pending'
            OR
            "Offers"."extensionApprovalStatus" = 'rejected'
          )
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
