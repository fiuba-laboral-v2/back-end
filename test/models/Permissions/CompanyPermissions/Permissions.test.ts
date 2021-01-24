import { CompanyPermissions } from "$models/Permissions";
import { CompanyWithNoInternshipAgreementError } from "$models/Offer";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { CareerRepository } from "$models/Career";
import { Company } from "$models";

import { JobApplicationGenerator } from "$generators/JobApplication";
import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";

describe("CompanyPermissions", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
  });

  describe("canSeeOffer", () => {
    it("returns true if the offer is from the company", async () => {
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      const permissions = new CompanyPermissions(companyUuid);
      expect(await permissions.canSeeOffer(offer)).toBe(true);
    });

    it("returns true if the offer is not from the company", async () => {
      const myCompany = await CompanyGenerator.instance.withMinimumData();
      const { uuid: companyUuid } = await CompanyGenerator.instance.withMinimumData();
      const offer = await OfferGenerator.instance.forStudents({ companyUuid });
      const permissions = new CompanyPermissions(myCompany.uuid);
      expect(await permissions.canSeeOffer(offer)).toBe(false);
    });
  });

  describe("canModerateOffer", () => {
    let company: Company;
    let anotherCompany: Company;

    beforeAll(async () => {
      company = await CompanyGenerator.instance.withCompleteData();
      anotherCompany = await CompanyGenerator.instance.withCompleteData();
    });

    it("does not allow a company to moderate its offer for students", async () => {
      const permissions = new CompanyPermissions(company.uuid);
      const offerForStudents = await OfferGenerator.instance.forStudents({
        companyUuid: company.uuid
      });
      expect(await permissions.canModerateOffer(offerForStudents)).toBe(false);
    });

    it("does not allow a company to moderate its offer for graduates", async () => {
      const permissions = new CompanyPermissions(company.uuid);
      const offerForGraduates = await OfferGenerator.instance.forGraduates({
        companyUuid: company.uuid
      });
      expect(await permissions.canModerateOffer(offerForGraduates)).toBe(false);
    });

    it("does not allow a company to moderate its offer for both", async () => {
      const permissions = new CompanyPermissions(company.uuid);
      const offerForStudentsAndGraduates = await OfferGenerator.instance.forStudentsAndGraduates({
        companyUuid: company.uuid
      });
      expect(await permissions.canModerateOffer(offerForStudentsAndGraduates)).toBe(false);
    });

    it("does not allow a company to moderate an offer for students", async () => {
      const permissions = new CompanyPermissions(company.uuid);
      const offerForStudents = await OfferGenerator.instance.forStudents({
        companyUuid: anotherCompany.uuid
      });
      expect(await permissions.canModerateOffer(offerForStudents)).toBe(false);
    });

    it("does not allow a company to moderate an offer for graduates", async () => {
      const permissions = new CompanyPermissions(company.uuid);
      const offerForGraduates = await OfferGenerator.instance.forGraduates({
        companyUuid: anotherCompany.uuid
      });
      expect(await permissions.canModerateOffer(offerForGraduates)).toBe(false);
    });

    it("does not allow a company to moderate an offer for both", async () => {
      const permissions = new CompanyPermissions(company.uuid);
      const offerForStudentsAndGraduates = await OfferGenerator.instance.forGraduates({
        companyUuid: anotherCompany.uuid
      });
      expect(await permissions.canModerateOffer(offerForStudentsAndGraduates)).toBe(false);
    });
  });

  describe("canModerateJobApplication", () => {
    it("returns false for any jobApplication", async () => {
      const company = await CompanyGenerator.instance.withCompleteData();
      const jobApplication = await JobApplicationGenerator.instance.withMinimumData();
      const permissions = new CompanyPermissions(company.uuid);
      expect(await permissions.canModerateJobApplication(jobApplication)).toBe(false);
    });
  });

  describe("canPublishInternship", () => {
    let companyWithInternshipAgreement: Company;
    let companyWithNoInternshipAgreement: Company;

    const mockRepository = (company: Company) =>
      jest.spyOn(CompanyRepository, "findByUuid").mockImplementation(async () => company);

    beforeAll(async () => {
      companyWithInternshipAgreement = new Company({
        ...CompanyGenerator.data.completeData(),
        hasAnInternshipAgreement: true
      });
      companyWithNoInternshipAgreement = new Company({
        ...CompanyGenerator.data.completeData(),
        hasAnInternshipAgreement: false
      });
    });

    it("throws an error if the company does not have an internship agreement", async () => {
      mockRepository(companyWithNoInternshipAgreement);
      const permissions = new CompanyPermissions(companyWithNoInternshipAgreement.uuid);
      await expect(permissions.canPublishInternship()).rejects.toThrowErrorWithMessage(
        CompanyWithNoInternshipAgreementError,
        CompanyWithNoInternshipAgreementError.buildMessage()
      );
    });

    it("returns true if the company does has an internship agreement", async () => {
      mockRepository(companyWithInternshipAgreement);
      const permissions = new CompanyPermissions(companyWithInternshipAgreement.uuid);
      expect(await permissions.canPublishInternship()).toBe(true);
    });
  });
});
