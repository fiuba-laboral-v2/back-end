import { OfferApprovalStatusApplicantPermission } from "$models/Permissions/ApplicantPermissions/OfferApprovalStatusApplicantPermission";
import { ApplicantType } from "$models/Applicant";
import { Admin, Offer } from "$models";
import { UUID } from "$models/UUID";
import { OfferGenerator } from "$generators/Offer";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { set } from "lodash";
import { Secretary } from "$models/Admin";

describe("OfferApprovalStatusApplicantPermission", () => {
  const createOfferWith = (target: ApplicantType, status: ApprovalStatus) => {
    const isStudent = target === ApplicantType.student || target === ApplicantType.both;
    const isGraduate = target === ApplicantType.graduate || target === ApplicantType.both;
    const companyUuid = UUID.generate();
    const attributes = OfferGenerator.data.withObligatoryData({ companyUuid });
    attributes.targetApplicantType = target;
    if (isStudent) set(attributes, "extensionApprovalStatus", status);
    if (isGraduate) set(attributes, "graduadosApprovalStatus", status);
    return new Offer(attributes);
  };

  describe("Student", () => {
    const applicantType = ApplicantType.student;

    it("returns true if the offer is approved for students", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.approved);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the offer is rejected for students", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.rejected);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(false);
    });

    it("returns false if the offer is pending for students", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.pending);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(false);
    });
  });

  describe("Graduate", () => {
    const applicantType = ApplicantType.graduate;

    it("returns true if the offer is approved for graduates", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.approved);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the offer is rejected for graduates", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.rejected);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(false);
    });

    it("returns false if the offer is pending for graduates", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.pending);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(false);
    });
  });

  describe("Graduate ans students", () => {
    const applicantType = ApplicantType.both;
    let extensionAdmin: Admin;
    let graduadosAdmin: Admin;

    beforeAll(() => {
      extensionAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
      graduadosAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.graduados });
    });

    it("returns true if the offer is approved for graduates and rejected for students", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.approved);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.approved, 15);
      offer.updateStatus(extensionAdmin, ApprovalStatus.rejected, 15);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(true);
    });

    it("returns true if the offer is approved for graduates and pending for students", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.approved);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.approved, 15);
      offer.updateStatus(extensionAdmin, ApprovalStatus.pending, 15);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(true);
    });

    it("returns true if the offer is rejected for graduates and approved for students", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.approved);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.rejected, 15);
      offer.updateStatus(extensionAdmin, ApprovalStatus.approved, 15);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(true);
    });

    it("returns true if the offer is pending for graduates and approved for students", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.approved);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.pending, 15);
      offer.updateStatus(extensionAdmin, ApprovalStatus.approved, 15);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(true);
    });

    it("returns false if the offer is pending for both", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.approved);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.pending, 15);
      offer.updateStatus(extensionAdmin, ApprovalStatus.pending, 15);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(false);
    });

    it("returns false if the offer is rejected for both", () => {
      const offer = createOfferWith(applicantType, ApprovalStatus.approved);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.rejected, 15);
      offer.updateStatus(extensionAdmin, ApprovalStatus.rejected, 15);
      const permission = new OfferApprovalStatusApplicantPermission(offer, applicantType);
      expect(permission.apply()).toBe(false);
    });
  });
});
