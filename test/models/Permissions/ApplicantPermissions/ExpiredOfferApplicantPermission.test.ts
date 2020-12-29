import { ExpiredOfferApplicantPermission } from "$models/Permissions/ApplicantPermissions/ExpiredOfferApplicantPermission";
import { ApplicantType } from "$models/Applicant";
import { Admin, Offer } from "$models";
import { UUID } from "$models/UUID";
import { OfferGenerator } from "$generators/Offer";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { DateTimeManager } from "$libs/DateTimeManager";

describe("ExpiredOfferApplicantPermission", () => {
  let extensionAdmin: Admin;
  let graduadosAdmin: Admin;

  const createOfferWith = (targetApplicantType: ApplicantType) => {
    const companyUuid = UUID.generate();
    const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
    return new Offer({
      ...attributes,
      targetApplicantType,
      extensionApprovalStatus: ApprovalStatus.approved,
      graduadosApprovalStatus: ApprovalStatus.approved,
      studentsExpirationDateTime: DateTimeManager.daysFromNow(15).toDate(),
      graduatesExpirationDateTime: DateTimeManager.daysFromNow(15).toDate()
    });
  };

  beforeAll(() => {
    extensionAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
    graduadosAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.graduados });
  });

  describe("Student", () => {
    let offer: Offer;
    const applicantType = ApplicantType.student;

    beforeAll(() => (offer = createOfferWith(applicantType)));

    it("returns true if the offer is not expired", async () => {
      offer.updateStatus(extensionAdmin, ApprovalStatus.approved, 15);
      const permission = new ExpiredOfferApplicantPermission(offer, applicantType);
      expect(await permission.apply()).toBe(true);
    });

    it("returns false if the applicant is a graduate", async () => {
      const permission = new ExpiredOfferApplicantPermission(offer, ApplicantType.graduate);
      expect(await permission.apply()).toBe(false);
    });
  });

  describe("Graduates", () => {
    let offer: Offer;
    const applicantType = ApplicantType.graduate;

    beforeAll(() => (offer = createOfferWith(applicantType)));

    it("returns true if the offer is not expired", async () => {
      offer.updateStatus(graduadosAdmin, ApprovalStatus.approved, 15);
      const permission = new ExpiredOfferApplicantPermission(offer, applicantType);
      expect(await permission.apply()).toBe(true);
    });

    it("returns false if the applicant is a student", async () => {
      const permission = new ExpiredOfferApplicantPermission(offer, ApplicantType.student);
      expect(await permission.apply()).toBe(false);
    });
  });

  describe("Graduates and students", () => {
    let offer: Offer;
    const applicantType = ApplicantType.both;

    beforeAll(() => (offer = createOfferWith(applicantType)));

    it("returns true if the offer is not expired", async () => {
      offer.updateStatus(extensionAdmin, ApprovalStatus.approved, 15);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.approved, 15);
      const permission = new ExpiredOfferApplicantPermission(offer, applicantType);
      expect(await permission.apply()).toBe(true);
    });
  });
});
