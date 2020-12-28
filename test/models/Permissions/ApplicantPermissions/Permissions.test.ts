import { ApplicantPermissions } from "$models/Permissions";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";

import { IForAllTargetsAndStatuses, OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";
import { Applicant } from "$models";
import { ApplicantType } from "$models/Applicant";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { JobApplicationRepository } from "$models/JobApplication";

describe("ApplicantPermissions", () => {
  let offers: IForAllTargetsAndStatuses;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    const { uuid: companyUuid } = await CompanyGenerator.instance.withCompleteData();
    offers = await OfferGenerator.instance.forAllTargetsAndStatuses({ companyUuid });
  });

  describe("canSeeOffer", () => {
    const mockHasApplied = (hasApplied: boolean) =>
      jest.spyOn(JobApplicationRepository, "hasApplied").mockImplementation(async () => hasApplied);

    it("returns true if the offer is approved for students and the applicant is a student", async () => {
      const offer = offers[ApplicantType.student][ApprovalStatus.approved];
      const applicant = await ApplicantGenerator.instance.student();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns false if the offer is pending for students and the applicant is a student", async () => {
      const offer = offers[ApplicantType.student][ApprovalStatus.pending];
      const applicant = await ApplicantGenerator.instance.student();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns false if the offer is rejected for students and the applicant is a student", async () => {
      const offer = offers[ApplicantType.student][ApprovalStatus.rejected];
      const applicant = await ApplicantGenerator.instance.student();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns true if the offer is approved for graduates and the applicant is a graduate", async () => {
      const offer = offers[ApplicantType.graduate][ApprovalStatus.approved];
      const applicant = await ApplicantGenerator.instance.graduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns false if the offer is pending for graduates and the applicant is a graduate", async () => {
      const offer = offers[ApplicantType.graduate][ApprovalStatus.pending];
      const applicant = await ApplicantGenerator.instance.graduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns false if the offer is rejected for graduates and the applicant is a graduate", async () => {
      const offer = offers[ApplicantType.graduate][ApprovalStatus.rejected];
      const applicant = await ApplicantGenerator.instance.graduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns true if the offer is approved for both and the applicant is both", async () => {
      const offer = offers[ApplicantType.both][ApprovalStatus.approved];
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns false if the offer is pending for both and the applicant is both", async () => {
      const offer = offers[ApplicantType.both][ApprovalStatus.pending];
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns false if the offer is rejected for both and the applicant is both", async () => {
      const offer = offers[ApplicantType.both][ApprovalStatus.rejected];
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns false if the offer is for students and the applicant is a graduate", async () => {
      const offer = offers[ApplicantType.student][ApprovalStatus.approved];
      const applicant = await ApplicantGenerator.instance.graduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns false if the offer is for graduates and the applicant is a student", async () => {
      const offer = offers[ApplicantType.graduate][ApprovalStatus.approved];
      const applicant = await ApplicantGenerator.instance.student();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns true if the offer is approved for both and the applicant is a student", async () => {
      const offer = offers[ApplicantType.both][ApprovalStatus.approved];
      const applicant = await ApplicantGenerator.instance.student();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns true if the offer is approved for both and the applicant is a graduate", async () => {
      const offer = offers[ApplicantType.both][ApprovalStatus.approved];
      const applicant = await ApplicantGenerator.instance.graduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns true if the offer approved is for students and the applicant is both", async () => {
      const offer = offers[ApplicantType.student][ApprovalStatus.approved];
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns false if the offer pending is for students and the applicant is both", async () => {
      const offer = offers[ApplicantType.student][ApprovalStatus.pending];
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns false if the offer rejected is for students and the applicant is both", async () => {
      const offer = offers[ApplicantType.student][ApprovalStatus.rejected];
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns true if the offer is approved for graduates and the applicant is both", async () => {
      const offer = offers[ApplicantType.graduate][ApprovalStatus.approved];
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns false if the offer is pending for graduates and the applicant is both", async () => {
      const offer = offers[ApplicantType.graduate][ApprovalStatus.pending];
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns false if the offer is rejected for graduates and the applicant is both", async () => {
      const offer = offers[ApplicantType.graduate][ApprovalStatus.rejected];
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns false if the offer is expired and the applicant has not applied", async () => {
      mockHasApplied(false);
      const offer = offers[ApplicantType.graduate][ApprovalStatus.approved];
      offer.expire();
      const applicant = await ApplicantGenerator.instance.graduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns true if the offer is expired and the applicant has applied", async () => {
      mockHasApplied(true);
      const offer = offers[ApplicantType.graduate][ApprovalStatus.approved];
      offer.expire();
      const applicant = await ApplicantGenerator.instance.graduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });
  });

  describe("canModerateOffer", () => {
    let student: Applicant;
    let graduate: Applicant;
    let studentAndGraduate: Applicant;

    beforeAll(async () => {
      student = await ApplicantGenerator.instance.student();
      graduate = await ApplicantGenerator.instance.graduate();
      studentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate();
    });

    it("does not allow a student to moderate an approved offer for students", async () => {
      const permissions = new ApplicantPermissions(student.uuid);
      expect(
        await permissions.canModerateOffer(offers[ApplicantType.student][ApprovalStatus.approved])
      ).toBe(false);
    });

    it("does not allow a student to moderate an approved offer for graduates", async () => {
      const permissions = new ApplicantPermissions(student.uuid);
      expect(
        await permissions.canModerateOffer(offers[ApplicantType.graduate][ApprovalStatus.approved])
      ).toBe(false);
    });

    it("does not allow a student to moderate an approved offer for both", async () => {
      const permissions = new ApplicantPermissions(student.uuid);
      expect(
        await permissions.canModerateOffer(offers[ApplicantType.both][ApprovalStatus.approved])
      ).toBe(false);
    });

    it("does not allow a graduate to moderate an approved offer for students", async () => {
      const permissions = new ApplicantPermissions(graduate.uuid);
      expect(
        await permissions.canModerateOffer(offers[ApplicantType.student][ApprovalStatus.approved])
      ).toBe(false);
    });

    it("does not allow a graduate to moderate an approved offer for graduates", async () => {
      const permissions = new ApplicantPermissions(graduate.uuid);
      expect(
        await permissions.canModerateOffer(offers[ApplicantType.graduate][ApprovalStatus.approved])
      ).toBe(false);
    });

    it("does not allow a graduate to moderate an approved offer for both", async () => {
      const permissions = new ApplicantPermissions(graduate.uuid);
      expect(
        await permissions.canModerateOffer(offers[ApplicantType.both][ApprovalStatus.approved])
      ).toBe(false);
    });

    it("does not allow a student and graduate to moderate an approved offer for students", async () => {
      const permissions = new ApplicantPermissions(studentAndGraduate.uuid);
      expect(
        await permissions.canModerateOffer(offers[ApplicantType.student][ApprovalStatus.approved])
      ).toBe(false);
    });

    it("does not allow a student and graduate to moderate an approved offer for graduates", async () => {
      const permissions = new ApplicantPermissions(studentAndGraduate.uuid);
      expect(
        await permissions.canModerateOffer(offers[ApplicantType.graduate][ApprovalStatus.approved])
      ).toBe(false);
    });

    it("does not allow a student and graduate to moderate an approved offer for both", async () => {
      const permissions = new ApplicantPermissions(studentAndGraduate.uuid);
      expect(
        await permissions.canModerateOffer(offers[ApplicantType.both][ApprovalStatus.approved])
      ).toBe(false);
    });
  });
});
