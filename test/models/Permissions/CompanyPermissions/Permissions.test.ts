import { CompanyPermissions } from "$models/Permissions";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";

import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";

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
});
