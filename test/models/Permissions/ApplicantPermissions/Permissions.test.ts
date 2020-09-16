import { ApplicantPermissions } from "$models/Permissions";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";

import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { ApplicantGenerator } from "$generators/Applicant";

describe("ApplicantPermissions", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  describe("canSeeOffer", () => {
    let companyUuid: string;

    beforeAll(async () => {
      const company = await CompanyGenerator.instance.withMinimumData();
      companyUuid = company.uuid;
    });

    it("returns true if the offer is for students and the applicant is a student", async () => {
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      const applicant = await ApplicantGenerator.instance.student();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns true if the offer is for graduates and the applicant is a graduate", async () => {
      const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
      const applicant = await ApplicantGenerator.instance.graduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns true if the offer is for both and the applicant is both", async () => {
      const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns false if the offer is for students and the applicant is a graduate", async () => {
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      const applicant = await ApplicantGenerator.instance.graduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns false if the offer is for graduates and the applicant is a student", async () => {
      const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
      const applicant = await ApplicantGenerator.instance.student();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });

    it("returns true if the offer is for both and the applicant is a student", async () => {
      const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
      const applicant = await ApplicantGenerator.instance.student();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns true if the offer is for both and the applicant is a graduate", async () => {
      const offer = await OfferGenerator.instance.forStudentsAndGraduates({ companyUuid });
      const applicant = await ApplicantGenerator.instance.graduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns true if the offer is for students and the applicant is both", async () => {
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns true if the offer is for graduates and the applicant is both", async () => {
      const offer = await OfferGenerator.instance.forGraduates({ companyUuid });
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const permissions = new ApplicantPermissions(applicant.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });
  });
});
