import { AdminPermissions } from "$models/Permissions";
import { UserRepository } from "$models/User";
import { ApplicantRepository } from "$models/Applicant";
import { CareerRepository } from "$models/Career";
import { OfferRepository } from "$models/Offer";
import { JobApplicationRepository } from "$models/JobApplication";
import { CompanyRepository } from "$models/Company";
import { Admin, Applicant, Company, JobApplication, Offer } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";

import { ApplicantGenerator } from "$generators/Applicant";
import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";

describe("AdminPermissions", () => {
  let extensionAdmin: Admin;
  let graduadosAdmin: Admin;
  let company: Company;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();

    extensionAdmin = await AdminGenerator.extension();
    graduadosAdmin = await AdminGenerator.graduados();
    company = await CompanyGenerator.instance.withCompleteData();
  });

  const createOffer = async () => {
    const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
    return OfferGenerator.instance.forStudents({ companyUuid });
  };

  describe("canSeeOffer", () => {
    it("returns true if the offer is from any company", async () => {
      const firstOffer = await createOffer();
      const secondOffer = await createOffer();
      const thirdOffer = await createOffer();
      const permissions = new AdminPermissions(extensionAdmin.userUuid);
      expect(await permissions.canSeeOffer(firstOffer)).toBe(true);
      expect(await permissions.canSeeOffer(secondOffer)).toBe(true);
      expect(await permissions.canSeeOffer(thirdOffer)).toBe(true);
    });
  });

  describe("canPublishInternship", () => {
    it("always returns false for extension admin", async () => {
      const permissions = new AdminPermissions(extensionAdmin.userUuid);
      expect(await permissions.canPublishInternship()).toBe(false);
    });

    it("always returns false for graduados admin", async () => {
      const permissions = new AdminPermissions(graduadosAdmin.userUuid);
      expect(await permissions.canPublishInternship()).toBe(false);
    });
  });

  describe("canModerateOffer", () => {
    let companyUuid: string;

    beforeAll(async () => (companyUuid = company.uuid));

    beforeEach(async () => {
      company.set({ approvalStatus: ApprovalStatus.approved });
      await CompanyRepository.save(company);
    });

    it("returns true if the offer is for students and the admin from extension", async () => {
      const permissions = new AdminPermissions(extensionAdmin.userUuid);
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      expect(await permissions.canModerateOffer(offer)).toBe(true);
    });

    it("returns true if the offer is for both and the admin from extension", async () => {
      const permissions = new AdminPermissions(extensionAdmin.userUuid);
      const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
      expect(await permissions.canModerateOffer(offer)).toBe(true);
    });

    it("returns true if the offer is for graduates and the admin from graduados", async () => {
      const permissions = new AdminPermissions(graduadosAdmin.userUuid);
      const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
      expect(await permissions.canModerateOffer(offer)).toBe(true);
    });

    it("returns true if the offer is for both and the admin from graduados", async () => {
      const permissions = new AdminPermissions(graduadosAdmin.userUuid);
      const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
      expect(await permissions.canModerateOffer(offer)).toBe(true);
    });

    it("returns false if the offer is for graduates and the admin from extension", async () => {
      const permissions = new AdminPermissions(extensionAdmin.userUuid);
      const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
      expect(await permissions.canModerateOffer(offer)).toBe(false);
    });

    it("returns false if the offer is for students and the admin from graduados", async () => {
      const permissions = new AdminPermissions(graduadosAdmin.userUuid);
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      expect(await permissions.canModerateOffer(offer)).toBe(false);
    });

    it("returns false if the company's offer is rejected", async () => {
      company.set({ approvalStatus: ApprovalStatus.rejected });
      await CompanyRepository.save(company);
      const permissions = new AdminPermissions(extensionAdmin.userUuid);
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      expect(await permissions.canModerateOffer(offer)).toBe(false);
    });

    it("returns false if the company's offer is pending", async () => {
      company.set({ approvalStatus: ApprovalStatus.pending });
      await CompanyRepository.save(company);
      const permissions = new AdminPermissions(extensionAdmin.userUuid);
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      expect(await permissions.canModerateOffer(offer)).toBe(false);
    });
  });

  describe("canModerateJobApplication", () => {
    let offer: Offer;

    beforeAll(async () => {
      offer = await OfferGenerator.instance.withObligatoryData({ companyUuid: company.uuid });
    });

    beforeEach(async () => {
      company.set({ approvalStatus: ApprovalStatus.approved });
      await CompanyRepository.save(company);

      offer.updateStatus(extensionAdmin, ApprovalStatus.approved, 15);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.approved, 15);
      await OfferRepository.save(offer);
    });

    describe("Extension admin", () => {
      let student: Applicant;
      let jobApplication: JobApplication;
      let admin: Admin;

      beforeAll(async () => {
        admin = extensionAdmin;
        student = await ApplicantGenerator.instance.student();
        jobApplication = student.applyTo(offer);
        await JobApplicationRepository.save(jobApplication);
      });

      beforeEach(async () => {
        student.set({ approvalStatus: ApprovalStatus.approved });
        await ApplicantRepository.save(student);
      });

      it("returns true if the student is approved", async () => {
        const permissions = new AdminPermissions(admin.userUuid);
        expect(await permissions.canModerateJobApplication(jobApplication)).toBe(true);
      });

      it("returns false if the student is rejected", async () => {
        student.set({ approvalStatus: ApprovalStatus.rejected });
        await ApplicantRepository.save(student);
        const permissions = new AdminPermissions(admin.userUuid);
        expect(await permissions.canModerateJobApplication(jobApplication)).toBe(false);
      });

      it("returns false if the student is pending", async () => {
        student.set({ approvalStatus: ApprovalStatus.pending });
        await ApplicantRepository.save(student);
        const permissions = new AdminPermissions(admin.userUuid);
        expect(await permissions.canModerateJobApplication(jobApplication)).toBe(false);
      });

      it("returns false if the applicant is a graduate", async () => {
        const graduate = await ApplicantGenerator.instance.graduate({
          status: ApprovalStatus.approved
        });
        const graduateJobApplication = graduate.applyTo(offer);
        await JobApplicationRepository.save(graduateJobApplication);
        const permissions = new AdminPermissions(admin.userUuid);
        expect(await permissions.canModerateJobApplication(graduateJobApplication)).toBe(false);
      });

      it("returns false if the applicant is a student and a graduate", async () => {
        const studentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate({
          status: ApprovalStatus.approved
        });
        const studentAndGraduateJobApplication = studentAndGraduate.applyTo(offer);
        await JobApplicationRepository.save(studentAndGraduateJobApplication);
        const permissions = new AdminPermissions(admin.userUuid);
        expect(await permissions.canModerateJobApplication(studentAndGraduateJobApplication)).toBe(
          false
        );
      });
    });

    describe("Graduados admin", () => {
      let graduate: Applicant;
      let jobApplication: JobApplication;
      let admin: Admin;

      beforeAll(async () => {
        admin = graduadosAdmin;
        graduate = await ApplicantGenerator.instance.graduate({ status: ApprovalStatus.approved });
        jobApplication = graduate.applyTo(offer);
        await JobApplicationRepository.save(jobApplication);
      });

      beforeEach(async () => {
        graduate.set({ approvalStatus: ApprovalStatus.approved });
        await ApplicantRepository.save(graduate);
      });

      it("returns true if the graduate, the company and the offer are approved", async () => {
        const permissions = new AdminPermissions(admin.userUuid);
        expect(await permissions.canModerateJobApplication(jobApplication)).toBe(true);
      });

      it("returns true if the applicant is a student and a graduate", async () => {
        const studentAndGraduate = await ApplicantGenerator.instance.studentAndGraduate({
          status: ApprovalStatus.approved
        });
        const studentAndGraduateJobApplication = studentAndGraduate.applyTo(offer);
        await JobApplicationRepository.save(studentAndGraduateJobApplication);
        const permissions = new AdminPermissions(admin.userUuid);
        expect(await permissions.canModerateJobApplication(studentAndGraduateJobApplication)).toBe(
          true
        );
      });

      it("returns false if the graduate is rejected", async () => {
        graduate.set({ approvalStatus: ApprovalStatus.rejected });
        await ApplicantRepository.save(graduate);
        const permissions = new AdminPermissions(admin.userUuid);
        expect(await permissions.canModerateJobApplication(jobApplication)).toBe(false);
      });

      it("returns false if the graduate is pending", async () => {
        graduate.set({ approvalStatus: ApprovalStatus.pending });
        await ApplicantRepository.save(graduate);
        const permissions = new AdminPermissions(admin.userUuid);
        expect(await permissions.canModerateJobApplication(jobApplication)).toBe(false);
      });
    });
  });
});
