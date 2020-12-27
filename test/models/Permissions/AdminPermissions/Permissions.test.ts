import { AdminPermissions } from "$models/Permissions";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { Admin } from "$models";
import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";

describe("AdminPermissions", () => {
  let extensionAdmin: Admin;
  let graduadosAdmin: Admin;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CompanyRepository.truncate();

    extensionAdmin = await AdminGenerator.extension();
    graduadosAdmin = await AdminGenerator.graduados();
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

  describe("canModerateOffer", () => {
    let companyUuid: string;

    beforeAll(async () => {
      companyUuid = (await CompanyGenerator.instance.withCompleteData()).uuid;
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
  });
});
