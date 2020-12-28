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

    it("returns true if the offer is for students and the applicant is a student", async () => {
      const permissions = new OfferTargetApplicantPermission(offer, ApplicantType.student);
      expect(await permissions.apply()).toBe(true);
    });

    it("returns true if the offer is for students and the applicant is both", async () => {
      const permissions = new OfferTargetApplicantPermission(offer, ApplicantType.both);
      expect(await permissions.apply()).toBe(true);
    });

    it("returns false if the offer is for students and the applicant is a graduate", async () => {
      const permissions = new OfferTargetApplicantPermission(offer, ApplicantType.graduate);
      expect(await permissions.apply()).toBe(false);
    });
  });

  describe("offerForGraduados", () => {
    let offer: Offer;

    beforeAll(() => (offer = createOfferWith(ApplicantType.graduate)));

    it("returns true if the offer is for graduates and the applicant is a graduate", async () => {
      const permissions = new OfferTargetApplicantPermission(offer, ApplicantType.graduate);
      expect(await permissions.apply()).toBe(true);
    });

    it("returns true if the offer is for graduates and the applicant is both", async () => {
      const permissions = new OfferTargetApplicantPermission(offer, ApplicantType.both);
      expect(await permissions.apply()).toBe(true);
    });

    it("returns false if the offer is for graduates and the applicant is a student", async () => {
      const permissions = new OfferTargetApplicantPermission(offer, ApplicantType.student);
      expect(await permissions.apply()).toBe(false);
    });
  });

  describe("offerForBoth", () => {
    let offer: Offer;

    beforeAll(() => (offer = createOfferWith(ApplicantType.both)));

    it("returns true if the offer is for both and the applicant is a student", async () => {
      const permissions = new OfferTargetApplicantPermission(offer, ApplicantType.student);
      expect(await permissions.apply()).toBe(true);
    });

    it("returns true if the offer is for both and the applicant is a graduate", async () => {
      const permissions = new OfferTargetApplicantPermission(offer, ApplicantType.graduate);
      expect(await permissions.apply()).toBe(true);
    });

    it("returns true if the offer is for both and the applicant is both", async () => {
      const permissions = new OfferTargetApplicantPermission(offer, ApplicantType.both);
      expect(await permissions.apply()).toBe(true);
    });
  });
});
