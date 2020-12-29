import { AdminPermissions } from "$models/Permissions";
import { UserRepository } from "$models/User";
import { CompanyRepository } from "$models/Company";
import { Admin, Company } from "$models";
import { OfferGenerator } from "$generators/Offer";
import { CompanyGenerator } from "$generators/Company";
import { AdminGenerator } from "$generators/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";

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
    let company: Company;
    let companyUuid: string;

    beforeAll(async () => {
      company = await CompanyGenerator.instance.withCompleteData();
      companyUuid = company.uuid;
    });

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
});
