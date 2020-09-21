import { AdminPermissions } from "$models/Permissions";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { Admin } from "$models";

import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";

describe("AdminPermissions", () => {
  let extensionAdmin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();

    extensionAdmin = await AdminGenerator.extension();
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
});
