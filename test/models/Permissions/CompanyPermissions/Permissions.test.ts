import { CompanyPermissions } from "$models/Permissions";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";

import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { Company } from "$models";

describe("CompanyPermissions", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();
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

    it("does not allow a company to moderate my offer for students", async () => {
      const permissions = new CompanyPermissions(company.uuid);
      const offerForStudents = await OfferGenerator.instance.forStudents({
        companyUuid: company.uuid
      });
      expect(await permissions.canModerateOffer(offerForStudents)).toBe(false);
    });

    it("does not allow a company to moderate my offer for graduates", async () => {
      const permissions = new CompanyPermissions(company.uuid);
      const offerForGraduates = await OfferGenerator.instance.forGraduates({
        companyUuid: company.uuid
      });
      expect(await permissions.canModerateOffer(offerForGraduates)).toBe(false);
    });

    it("does not allow a company to moderate my offer for both", async () => {
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
});
