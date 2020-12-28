import { ExpiredOfferApplicantPermission } from "$models/Permissions/ApplicantPermissions/ExpiredOfferApplicantPermission";
import { ApplicantType } from "$models/Applicant";
import { Admin, Applicant, Offer } from "$models";
import { UUID } from "$models/UUID";
import { OfferGenerator } from "$generators/Offer";
import { JobApplicationRepository } from "$models/JobApplication";
import { Secretary } from "$models/Admin";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { DateTimeManager } from "$libs/DateTimeManager";

describe("ExpiredOfferApplicantPermission", () => {
  let extensionAdmin: Admin;
  let graduadosAdmin: Admin;
  let applicant: Applicant;

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

  const mockHasApplied = (hasApplied: boolean) =>
    jest.spyOn(JobApplicationRepository, "hasApplied").mockImplementation(async () => hasApplied);

  beforeAll(() => {
    extensionAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
    graduadosAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.graduados });

    applicant = new Applicant({ userUuid: UUID.generate(), padron: 1 });
  });

  describe("Student", () => {
    let offer: Offer;
    const applicantType = ApplicantType.student;

    beforeAll(() => (offer = createOfferWith(applicantType)));

    it("returns true if the offer is expired and the applicant has applied", async () => {
      mockHasApplied(true);
      offer.expire();
      const permission = new ExpiredOfferApplicantPermission(applicant, offer, applicantType);
      expect(await permission.apply()).toBe(true);
    });

    it("returns true if the offer is not expired", async () => {
      offer.updateStatus(extensionAdmin, ApprovalStatus.approved, 15);
      const permission = new ExpiredOfferApplicantPermission(applicant, offer, applicantType);
      expect(await permission.apply()).toBe(true);
    });

    it("returns false if the offer is expired and the applicant has not applied", async () => {
      mockHasApplied(false);
      offer.expire();
      const permission = new ExpiredOfferApplicantPermission(applicant, offer, applicantType);
      expect(await permission.apply()).toBe(false);
    });

    it("returns false if the applicant is a graduate", async () => {
      const permission = new ExpiredOfferApplicantPermission(
        applicant,
        offer,
        ApplicantType.graduate
      );
      expect(await permission.apply()).toBe(false);
    });
  });

  describe("Graduates", () => {
    let offer: Offer;
    const applicantType = ApplicantType.graduate;

    beforeAll(() => (offer = createOfferWith(applicantType)));

    it("returns true if the offer is expired and the applicant has applied", async () => {
      mockHasApplied(true);
      offer.expire();
      const permission = new ExpiredOfferApplicantPermission(applicant, offer, applicantType);
      expect(await permission.apply()).toBe(true);
    });

    it("returns true if the offer is not expired", async () => {
      offer.updateStatus(graduadosAdmin, ApprovalStatus.approved, 15);
      const permission = new ExpiredOfferApplicantPermission(applicant, offer, applicantType);
      expect(await permission.apply()).toBe(true);
    });

    it("returns false if the offer is expired and the applicant has not applied", async () => {
      mockHasApplied(false);
      offer.expire();
      const permission = new ExpiredOfferApplicantPermission(applicant, offer, applicantType);
      expect(await permission.apply()).toBe(false);
    });

    it("returns false if the applicant is a student", async () => {
      const permission = new ExpiredOfferApplicantPermission(
        applicant,
        offer,
        ApplicantType.student
      );
      expect(await permission.apply()).toBe(false);
    });
  });

  describe("Graduates and students", () => {
    let offer: Offer;
    const applicantType = ApplicantType.both;

    beforeAll(() => (offer = createOfferWith(applicantType)));

    it("returns true if the offer is expired and the applicant has applied", async () => {
      mockHasApplied(true);
      offer.expire();
      const permission = new ExpiredOfferApplicantPermission(applicant, offer, applicantType);
      expect(await permission.apply()).toBe(true);
    });

    it("returns true if the offer is not expired", async () => {
      offer.updateStatus(extensionAdmin, ApprovalStatus.approved, 15);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.approved, 15);
      const permission = new ExpiredOfferApplicantPermission(applicant, offer, applicantType);
      expect(await permission.apply()).toBe(true);
    });

    it("returns false if the offer is expired and the applicant has not applied", async () => {
      mockHasApplied(false);
      offer.expire();
      const permission = new ExpiredOfferApplicantPermission(applicant, offer, applicantType);
      expect(await permission.apply()).toBe(false);
    });
  });
});
