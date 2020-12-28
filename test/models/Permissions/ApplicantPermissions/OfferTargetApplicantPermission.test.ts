import { OfferTargetApplicantPermission } from "$models/Permissions/ApplicantPermissions/OfferTargetApplicantPermission";
import { ApplicantType } from "$models/Applicant";
import { Offer } from "$models";
import { UUID } from "$models/UUID";
import { OfferGenerator } from "$generators/Offer";

describe("OfferTargetApplicantPermission", () => {
  const createOfferWith = (targetApplicantType: ApplicantType) => {
    const companyUuid = UUID.generate();
    const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
    return new Offer({ ...attributes, targetApplicantType });
  };

  describe("offerForStudents", () => {
    let offer: Offer;

    beforeAll(() => (offer = createOfferWith(ApplicantType.student)));

    it("returns true if the offer is for students and the applicant is a student", () => {
      const permission = new OfferTargetApplicantPermission(offer, ApplicantType.student);
      expect(permission.apply()).toBe(true);
    });

    it("returns true if the offer is for students and the applicant is both", () => {
      const permission = new OfferTargetApplicantPermission(offer, ApplicantType.both);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the offer is for students and the applicant is a graduate", () => {
      const permission = new OfferTargetApplicantPermission(offer, ApplicantType.graduate);
      expect(permission.apply()).toBe(false);
    });
  });

  describe("offerForGraduados", () => {
    let offer: Offer;

    beforeAll(() => (offer = createOfferWith(ApplicantType.graduate)));

    it("returns true if the offer is for graduates and the applicant is a graduate", () => {
      const permission = new OfferTargetApplicantPermission(offer, ApplicantType.graduate);
      expect(permission.apply()).toBe(true);
    });

    it("returns true if the offer is for graduates and the applicant is both", () => {
      const permission = new OfferTargetApplicantPermission(offer, ApplicantType.both);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the offer is for graduates and the applicant is a student", () => {
      const permission = new OfferTargetApplicantPermission(offer, ApplicantType.student);
      expect(permission.apply()).toBe(false);
    });
  });

  describe("offerForBoth", () => {
    let offer: Offer;

    beforeAll(() => (offer = createOfferWith(ApplicantType.both)));

    it("returns true if the offer is for both and the applicant is a student", () => {
      const permission = new OfferTargetApplicantPermission(offer, ApplicantType.student);
      expect(permission.apply()).toBe(true);
    });

    it("returns true if the offer is for both and the applicant is a graduate", () => {
      const permission = new OfferTargetApplicantPermission(offer, ApplicantType.graduate);
      expect(permission.apply()).toBe(true);
    });

    it("returns true if the offer is for both and the applicant is both", () => {
      const permission = new OfferTargetApplicantPermission(offer, ApplicantType.both);
      expect(permission.apply()).toBe(true);
    });
  });
});
