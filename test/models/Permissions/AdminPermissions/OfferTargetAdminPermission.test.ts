import { OfferTargetAdminPermission } from "$models/Permissions/AdminPermissions/OfferTargetAdminPermission";
import { ApplicantType } from "$models/Applicant";
import { Admin, Offer } from "$models";
import { UUID } from "$models/UUID";
import { OfferGenerator } from "$generators/Offer";
import { Secretary } from "$models/Admin";

describe("OfferTargetAdminPermission", () => {
  let extensionAdmin: Admin;
  let graduadosAdmin: Admin;

  const createOfferWith = (targetApplicantType: ApplicantType) => {
    const companyUuid = UUID.generate();
    const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
    return new Offer({ ...attributes, targetApplicantType });
  };

  beforeAll(() => {
    extensionAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
    graduadosAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.graduados });
  });

  describe("offerForStudents", () => {
    let offer: Offer;

    beforeAll(() => (offer = createOfferWith(ApplicantType.student)));

    it("returns true if the offer is for students and the admin is from extension", () => {
      const permission = new OfferTargetAdminPermission(offer, extensionAdmin);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the offer is for students and the admin is from graduados", () => {
      const permission = new OfferTargetAdminPermission(offer, graduadosAdmin);
      expect(permission.apply()).toBe(false);
    });
  });

  describe("offerForGraduados", () => {
    let offer: Offer;

    beforeAll(() => (offer = createOfferWith(ApplicantType.graduate)));

    it("returns true if the offer is for graduates and the admin is from graduados", () => {
      const permission = new OfferTargetAdminPermission(offer, graduadosAdmin);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the offer is for graduates and the admin is from extension", () => {
      const permission = new OfferTargetAdminPermission(offer, extensionAdmin);
      expect(permission.apply()).toBe(false);
    });
  });

  describe("offerForBoth", () => {
    let offer: Offer;

    beforeAll(() => (offer = createOfferWith(ApplicantType.both)));

    it("returns true if the offer is for both and the admin is from graduados", () => {
      const permission = new OfferTargetAdminPermission(offer, graduadosAdmin);
      expect(permission.apply()).toBe(true);
    });

    it("returns true if the offer is for both and the admin is from extension", () => {
      const permission = new OfferTargetAdminPermission(offer, extensionAdmin);
      expect(permission.apply()).toBe(true);
    });
  });
});
