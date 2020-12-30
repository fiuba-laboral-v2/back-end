import { ApprovedOfferAdminPermission } from "$models/Permissions/AdminPermissions/ApprovedOfferAdminPermission";
import { Admin, Offer } from "$models";
import { UUID } from "$models/UUID";
import { OfferGenerator } from "$generators/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { Secretary } from "$models/Admin";

describe("ApprovedOfferAdminPermission", () => {
  const createOfferWith = (status: ApprovalStatus) => {
    const companyUuid = UUID.generate();
    const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
    return new Offer({
      ...attributes,
      extensionApprovalStatus: status,
      graduadosApprovalStatus: status
    });
  };

  describe("Extension Admin", () => {
    let admin: Admin;

    beforeAll(() => {
      admin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
    });

    it("returns true if the offer is approved for students", () => {
      const offer = createOfferWith(ApprovalStatus.approved);
      const permission = new ApprovedOfferAdminPermission(admin, offer);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the offer is rejected for students", () => {
      const offer = createOfferWith(ApprovalStatus.rejected);
      const permission = new ApprovedOfferAdminPermission(admin, offer);
      expect(permission.apply()).toBe(false);
    });

    it("returns false if the offer is pending for students", () => {
      const offer = createOfferWith(ApprovalStatus.pending);
      const permission = new ApprovedOfferAdminPermission(admin, offer);
      expect(permission.apply()).toBe(false);
    });
  });

  describe("Graduados Admin", () => {
    let admin: Admin;

    beforeAll(() => {
      admin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.graduados });
    });

    it("returns true if the offer is approved for graduates", () => {
      const offer = createOfferWith(ApprovalStatus.approved);
      const permission = new ApprovedOfferAdminPermission(admin, offer);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the offer is rejected for graduates", () => {
      const offer = createOfferWith(ApprovalStatus.rejected);
      const permission = new ApprovedOfferAdminPermission(admin, offer);
      expect(permission.apply()).toBe(false);
    });

    it("returns false if the offer is pending for graduates", () => {
      const offer = createOfferWith(ApprovalStatus.pending);
      const permission = new ApprovedOfferAdminPermission(admin, offer);
      expect(permission.apply()).toBe(false);
    });
  });
});
