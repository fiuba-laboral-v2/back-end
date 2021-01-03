import {
  ApprovedOfferWithNoExpirationTimeError,
  InternshipsCannotHaveMaximumSalaryError,
  InternshipsMustTargetStudentsError,
  PendingOfferWithExpirationTimeError,
  RejectedOfferWithExpirationTimeError
} from "$models/Offer/Errors";
import {
  NumberIsTooLargeError,
  NumberIsTooSmallError,
  SalaryRangeError
} from "validations-fiuba-laboral-v2";
import { ValidationError } from "sequelize";

import { Admin, Offer } from "$models";
import { ApplicantType } from "$models/Applicant";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isApprovalStatus, isTargetApplicantType } from "$models/SequelizeModelValidators";
import { Secretary } from "$models/Admin";
import { UUID } from "$models/UUID";
import { DateTimeManager } from "$libs/DateTimeManager";

import { OfferGenerator } from "$generators/Offer";
import { omit } from "lodash";

describe("Offer", () => {
  const mandatoryAttributes = {
    companyUuid: UUID.generate(),
    title: "title",
    description: "description",
    isInternship: false,
    hoursPerDay: 8,
    minimumSalary: 52500,
    maximumSalary: 70000,
    targetApplicantType: ApplicantType.both
  };

  const offerWithoutProperty = (property: string) => omit(mandatoryAttributes, property);

  const createsAValidOfferWithTarget = async (targetApplicantType: ApplicantType) => {
    const offer = new Offer({ ...mandatoryAttributes, targetApplicantType });
    await expect(offer.validate()).resolves.not.toThrow();
  };

  it("creates a valid non-internship with maximum salary", async () => {
    const offer = new Offer(mandatoryAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid non-internship without maximum salary", async () => {
    const offer = new Offer({ ...mandatoryAttributes, maximumSalary: null });
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid internship", async () => {
    const offer = new Offer({
      ...mandatoryAttributes,
      isInternship: true,
      maximumSalary: null,
      targetApplicantType: ApplicantType.student
    });
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid offer with its given attributes", async () => {
    const offer = new Offer(mandatoryAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
    expect(offer).toBeObjectContaining(mandatoryAttributes);
  });

  it("creates a valid offer with a targetApplicantType for graduate", async () => {
    await createsAValidOfferWithTarget(ApplicantType.graduate);
  });

  it("creates a valid offer with a targetApplicantType for student", async () => {
    await createsAValidOfferWithTarget(ApplicantType.student);
  });

  it("creates a valid offer with a targetApplicantType for both student and graduate", async () => {
    await createsAValidOfferWithTarget(ApplicantType.both);
  });

  it("creates a valid offer with default extensionApprovalStatus", async () => {
    const offer = new Offer(mandatoryAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
    expect(offer.extensionApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("creates a valid offer with default graduadosApprovalStatus", async () => {
    const offer = new Offer(mandatoryAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
    expect(offer.graduadosApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("creates a valid offer without graduatesExpirationDateTime", async () => {
    const offer = new Offer(omit(mandatoryAttributes, ["graduatesExpirationDateTime"]));
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid offer without studentsExpirationDateTime", async () => {
    const offer = new Offer(omit(mandatoryAttributes, ["studentsExpirationDateTime"]));
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid offer with no studentsExpirationDateTime and graduatesExpirationDateTime", async () => {
    const offer = new Offer(mandatoryAttributes);
    expect(offer.studentsExpirationDateTime).toBeUndefined();
    expect(offer.graduatesExpirationDateTime).toBeUndefined();
  });

  describe("isExpiredFor", () => {
    it("returns true if the offer has expired for graduates", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        graduadosApprovalStatus: ApprovalStatus.approved,
        graduatesExpirationDateTime: DateTimeManager.yesterday(),
        targetApplicantType: ApplicantType.graduate
      });
      expect(expiredOffer.isExpiredFor(ApplicantType.graduate)).toBe(true);
    });

    it("returns false if the offer has not expired for graduates", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        graduadosApprovalStatus: ApprovalStatus.approved,
        graduatesExpirationDateTime: DateTimeManager.daysFromNow(11),
        targetApplicantType: ApplicantType.graduate
      });
      expect(expiredOffer.isExpiredFor(ApplicantType.graduate)).toBe(false);
    });

    it("returns true if the offer has expired for students", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        studentsExpirationDateTime: DateTimeManager.yesterday(),
        targetApplicantType: ApplicantType.graduate
      });
      expect(expiredOffer.isExpiredFor(ApplicantType.student)).toBe(true);
    });

    it("returns false if the offer has not expired for students", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        studentsExpirationDateTime: DateTimeManager.daysFromNow(11),
        targetApplicantType: ApplicantType.graduate
      });
      expect(expiredOffer.isExpiredFor(ApplicantType.student)).toBe(false);
    });

    it("returns false if the offer has expired for students but not for graduates", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        studentsExpirationDateTime: DateTimeManager.yesterday(),
        graduadosApprovalStatus: ApprovalStatus.approved,
        graduatesExpirationDateTime: DateTimeManager.daysFromNow(17),
        targetApplicantType: ApplicantType.both
      });
      expect(expiredOffer.isExpiredFor(ApplicantType.both)).toBe(false);
    });

    it("returns false if the offer has expired for graduates but not for students", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        studentsExpirationDateTime: DateTimeManager.daysFromNow(19),
        graduadosApprovalStatus: ApprovalStatus.approved,
        graduatesExpirationDateTime: DateTimeManager.yesterday(),
        targetApplicantType: ApplicantType.both
      });
      expect(expiredOffer.isExpiredFor(ApplicantType.both)).toBe(false);
    });

    it("returns true if the offer has expired for both", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        studentsExpirationDateTime: DateTimeManager.yesterday(),
        graduadosApprovalStatus: ApprovalStatus.approved,
        graduatesExpirationDateTime: DateTimeManager.yesterday(),
        targetApplicantType: ApplicantType.both
      });
      expect(expiredOffer.isExpiredFor(ApplicantType.both)).toBe(true);
    });
  });

  describe("republish", () => {
    const graduadosOfferDurationInDays = 15;
    const studentsOfferDurationInDays = 15;

    describe("when the targetApplicantType is student", () => {
      const createOfferTargetingStudents = (
        extensionApprovalStatus: ApprovalStatus,
        studentsExpirationDateTime?: Date
      ) => {
        return new Offer({
          ...mandatoryAttributes,
          extensionApprovalStatus,
          targetApplicantType: ApplicantType.student,
          ...(!!studentsExpirationDateTime && { studentsExpirationDateTime })
        });
      };

      it("republishes the offer when it's expired", async () => {
        const offer = createOfferTargetingStudents(
          ApprovalStatus.approved,
          DateTimeManager.yesterday()
        );

        expect(offer.isExpiredForStudents()).toBe(true);
        offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
        expect(offer.isExpiredForStudents()).toBe(false);
        await expect(offer.validate()).resolves.not.toThrow();
      });

      it("doesn't change the graduatesExpirationDateTime", async () => {
        const offer = createOfferTargetingStudents(
          ApprovalStatus.approved,
          DateTimeManager.yesterday()
        );

        expect(offer.isExpiredForGraduates()).toBe(false);
        offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
        expect(offer.isExpiredForGraduates()).toBe(false);
        await expect(offer.validate()).resolves.not.toThrow();
      });

      it("doesn't change the studentsExpirationDateTime if the offer is pending", async () => {
        const offer = createOfferTargetingStudents(ApprovalStatus.pending);

        expect(offer.isExpiredForStudents()).toBe(false);
        offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
        expect(offer.isExpiredForStudents()).toBe(false);
        await expect(offer.validate()).resolves.not.toThrow();
      });

      it("doesn't change the studentsExpirationDateTime if the offer is rejected", async () => {
        const offer = createOfferTargetingStudents(ApprovalStatus.rejected);

        expect(offer.isExpiredForStudents()).toBe(false);
        offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
        expect(offer.isExpiredForStudents()).toBe(false);
        await expect(offer.validate()).resolves.not.toThrow();
      });
    });

    describe("when the targetApplicantType is graduate", () => {
      const createOfferTargetingGraduates = (
        graduadosApprovalStatus: ApprovalStatus,
        graduatesExpirationDateTime?: Date
      ) => {
        return new Offer({
          ...mandatoryAttributes,
          graduadosApprovalStatus,
          targetApplicantType: ApplicantType.graduate,
          ...(!!graduatesExpirationDateTime && { graduatesExpirationDateTime })
        });
      };

      it("republishes the offer when it's expired", async () => {
        const offer = createOfferTargetingGraduates(
          ApprovalStatus.approved,
          DateTimeManager.yesterday()
        );

        expect(offer.isExpiredForGraduates()).toBe(true);
        offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
        expect(offer.isExpiredForGraduates()).toBe(false);
        await expect(offer.validate()).resolves.not.toThrow();
      });

      it("doesn't change the studentsExpirationDateTime", async () => {
        const offer = createOfferTargetingGraduates(
          ApprovalStatus.approved,
          DateTimeManager.yesterday()
        );

        expect(offer.isExpiredForStudents()).toBe(false);
        offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
        expect(offer.isExpiredForStudents()).toBe(false);
        await expect(offer.validate()).resolves.not.toThrow();
      });

      it("doesn't change the graduatesExpirationDateTime if the offer is pending", async () => {
        const offer = createOfferTargetingGraduates(ApprovalStatus.pending);
        expect(offer.isExpiredForGraduates()).toBe(false);
        offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
        expect(offer.isExpiredForGraduates()).toBe(false);
        await expect(offer.validate()).resolves.not.toThrow();
      });

      it("doesn't change the graduatesExpirationDateTime if the offer is rejected", async () => {
        const offer = createOfferTargetingGraduates(ApprovalStatus.rejected);

        expect(offer.isExpiredForGraduates()).toBe(false);
        offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
        expect(offer.isExpiredForGraduates()).toBe(false);
        await expect(offer.validate()).resolves.not.toThrow();
      });
    });

    describe("when the targetApplicantType is both", () => {
      it("republishes the offer for students and graduados when both have expired", async () => {
        const offer = new Offer({
          ...mandatoryAttributes,
          graduadosApprovalStatus: ApprovalStatus.approved,
          extensionApprovalStatus: ApprovalStatus.approved,
          targetApplicantType: ApplicantType.both,
          graduatesExpirationDateTime: DateTimeManager.yesterday(),
          studentsExpirationDateTime: DateTimeManager.yesterday()
        });

        expect(offer.isExpiredForGraduates()).toBe(true);
        expect(offer.isExpiredForStudents()).toBe(true);
        offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
        expect(offer.isExpiredForGraduates()).toBe(false);
        expect(offer.isExpiredForStudents()).toBe(false);
        await expect(offer.validate()).resolves.not.toThrow();
      });

      describe("when only the offer for students have expired", () => {
        it("republishes only the offer for students", async () => {
          const offer = new Offer({
            ...mandatoryAttributes,
            graduadosApprovalStatus: ApprovalStatus.approved,
            extensionApprovalStatus: ApprovalStatus.approved,
            targetApplicantType: ApplicantType.both,
            graduatesExpirationDateTime: DateTimeManager.daysFromNow(15).toDate(),
            studentsExpirationDateTime: DateTimeManager.yesterday()
          });

          expect(offer.isExpiredForGraduates()).toBe(false);
          expect(offer.isExpiredForStudents()).toBe(true);
          offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
          expect(offer.isExpiredForGraduates()).toBe(false);
          expect(offer.isExpiredForStudents()).toBe(false);
          expect(offer.studentsExpirationDateTime).toBeDefined();
          expect(offer.graduatesExpirationDateTime).toBeDefined();
          await expect(offer.validate()).resolves.not.toThrow();
        });

        it("republishes only the offer for students when graduadosApprovalStatus is pending", async () => {
          const offer = new Offer({
            ...mandatoryAttributes,
            graduadosApprovalStatus: ApprovalStatus.pending,
            extensionApprovalStatus: ApprovalStatus.approved,
            targetApplicantType: ApplicantType.both,
            studentsExpirationDateTime: DateTimeManager.yesterday()
          });

          expect(offer.isExpiredForGraduates()).toBe(false);
          expect(offer.isExpiredForStudents()).toBe(true);
          offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
          expect(offer.isExpiredForGraduates()).toBe(false);
          expect(offer.isExpiredForStudents()).toBe(false);
          expect(offer.studentsExpirationDateTime).toBeDefined();
          expect(offer.graduatesExpirationDateTime).toBeUndefined();
          await expect(offer.validate()).resolves.not.toThrow();
        });

        it("republishes only the offer for students when graduadosApprovalStatus is rejected", async () => {
          const offer = new Offer({
            ...mandatoryAttributes,
            graduadosApprovalStatus: ApprovalStatus.rejected,
            extensionApprovalStatus: ApprovalStatus.approved,
            targetApplicantType: ApplicantType.both,
            studentsExpirationDateTime: DateTimeManager.yesterday()
          });

          expect(offer.isExpiredForGraduates()).toBe(false);
          expect(offer.isExpiredForStudents()).toBe(true);
          offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
          expect(offer.isExpiredForGraduates()).toBe(false);
          expect(offer.isExpiredForStudents()).toBe(false);
          expect(offer.studentsExpirationDateTime).toBeDefined();
          expect(offer.graduatesExpirationDateTime).toBeUndefined();
          await expect(offer.validate()).resolves.not.toThrow();
        });
      });

      describe("when only the offer for graduates have expired", () => {
        it("republishes only the offer for graduates", async () => {
          const offer = new Offer({
            ...mandatoryAttributes,
            graduadosApprovalStatus: ApprovalStatus.approved,
            extensionApprovalStatus: ApprovalStatus.approved,
            targetApplicantType: ApplicantType.both,
            graduatesExpirationDateTime: DateTimeManager.yesterday(),
            studentsExpirationDateTime: DateTimeManager.daysFromNow(15).toDate()
          });

          expect(offer.isExpiredForGraduates()).toBe(true);
          expect(offer.isExpiredForStudents()).toBe(false);
          offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
          expect(offer.isExpiredForGraduates()).toBe(false);
          expect(offer.isExpiredForStudents()).toBe(false);
          expect(offer.studentsExpirationDateTime).toBeDefined();
          expect(offer.graduatesExpirationDateTime).toBeDefined();
          await expect(offer.validate()).resolves.not.toThrow();
        });

        it("republishes only the offer for graduates when extensionApprovalStatus is pending", async () => {
          const offer = new Offer({
            ...mandatoryAttributes,
            graduadosApprovalStatus: ApprovalStatus.approved,
            extensionApprovalStatus: ApprovalStatus.pending,
            targetApplicantType: ApplicantType.both,
            graduatesExpirationDateTime: DateTimeManager.yesterday()
          });

          expect(offer.isExpiredForGraduates()).toBe(true);
          expect(offer.isExpiredForStudents()).toBe(false);
          offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
          expect(offer.isExpiredForGraduates()).toBe(false);
          expect(offer.isExpiredForStudents()).toBe(false);
          expect(offer.studentsExpirationDateTime).toBeUndefined();
          expect(offer.graduatesExpirationDateTime).toBeDefined();
          await expect(offer.validate()).resolves.not.toThrow();
        });

        it("republishes only the offer for students when extensionApprovalStatus is rejected", async () => {
          const offer = new Offer({
            ...mandatoryAttributes,
            graduadosApprovalStatus: ApprovalStatus.approved,
            extensionApprovalStatus: ApprovalStatus.rejected,
            targetApplicantType: ApplicantType.both,
            graduatesExpirationDateTime: DateTimeManager.yesterday()
          });

          expect(offer.isExpiredForGraduates()).toBe(true);
          expect(offer.isExpiredForStudents()).toBe(false);
          offer.republish(graduadosOfferDurationInDays, studentsOfferDurationInDays);
          expect(offer.isExpiredForGraduates()).toBe(false);
          expect(offer.isExpiredForStudents()).toBe(false);
          expect(offer.studentsExpirationDateTime).toBeUndefined();
          expect(offer.graduatesExpirationDateTime).toBeDefined();
          await expect(offer.validate()).resolves.not.toThrow();
        });
      });
    });
  });

  describe("expire", () => {
    it("returns true if the approved offer has expired for graduados", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        graduadosApprovalStatus: ApprovalStatus.approved,
        graduatesExpirationDateTime: DateTimeManager.yesterday(),
        targetApplicantType: ApplicantType.graduate
      });
      expect(expiredOffer.isExpiredForGraduates()).toBe(true);
    });

    it("returns true if the approved offer has expired for students", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        studentsExpirationDateTime: DateTimeManager.yesterday(),
        targetApplicantType: ApplicantType.student
      });
      expect(expiredOffer.isExpiredForStudents()).toBe(true);
    });

    it("returns true if the approved offer has expired for both", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        graduadosApprovalStatus: ApprovalStatus.approved,
        studentsExpirationDateTime: DateTimeManager.yesterday(),
        graduatesExpirationDateTime: DateTimeManager.yesterday(),
        targetApplicantType: ApplicantType.both
      });
      expect(expiredOffer.isExpiredForGraduates()).toBe(true);
      expect(expiredOffer.isExpiredForStudents()).toBe(true);
    });

    it("does not count as expired if the offer is rejected for students", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.rejected,
        targetApplicantType: ApplicantType.student
      });
      expect(expiredOffer.isExpiredForStudents()).toBe(false);
    });

    it("does not count as expired if the offer is pending for students", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.pending,
        targetApplicantType: ApplicantType.student
      });
      expect(expiredOffer.isExpiredForStudents()).toBe(false);
    });

    it("does not count as expired if the offer is rejected for graduates", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        graduadosApprovalStatus: ApprovalStatus.rejected,
        targetApplicantType: ApplicantType.graduate
      });
      expect(expiredOffer.isExpiredForStudents()).toBe(false);
    });

    it("does not count as expired if the offer is pending for graduates", async () => {
      const expiredOffer = new Offer({
        ...mandatoryAttributes,
        graduadosApprovalStatus: ApprovalStatus.rejected,
        targetApplicantType: ApplicantType.graduate
      });
      expect(expiredOffer.isExpiredForStudents()).toBe(false);
    });

    it("expires an approved offer for students", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        targetApplicantType: ApplicantType.student,
        studentsExpirationDateTime: DateTimeManager.daysFromNow(15)
      });

      expect(offer.isExpiredForStudents()).toBe(false);
      offer.expire();
      expect(offer.isExpiredForStudents()).toBe(true);
    });

    it("expires an approved offer for graduates", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        graduadosApprovalStatus: ApprovalStatus.approved,
        targetApplicantType: ApplicantType.graduate,
        graduatesExpirationDateTime: DateTimeManager.daysFromNow(15)
      });

      expect(offer.isExpiredForGraduates()).toBe(false);
      offer.expire();
      expect(offer.isExpiredForGraduates()).toBe(true);
    });

    describe("when the targetApplicantType is both", () => {
      it("expires an approved offer", async () => {
        const offer = new Offer({
          ...mandatoryAttributes,
          graduadosApprovalStatus: ApprovalStatus.approved,
          extensionApprovalStatus: ApprovalStatus.approved,
          targetApplicantType: ApplicantType.both,
          graduatesExpirationDateTime: DateTimeManager.daysFromNow(15),
          studentsExpirationDateTime: DateTimeManager.daysFromNow(15)
        });

        expect(offer.isExpiredForGraduates()).toBe(false);
        expect(offer.isExpiredForStudents()).toBe(false);
        offer.expire();
        expect(offer.isExpiredForGraduates()).toBe(true);
        expect(offer.isExpiredForStudents()).toBe(true);
      });

      it("expires only for graduates when is approved for graduates and pending for students", async () => {
        const offer = new Offer({
          ...mandatoryAttributes,
          graduadosApprovalStatus: ApprovalStatus.approved,
          extensionApprovalStatus: ApprovalStatus.pending,
          targetApplicantType: ApplicantType.both,
          graduatesExpirationDateTime: DateTimeManager.daysFromNow(15)
        });

        expect(offer.isExpiredForGraduates()).toBe(false);
        expect(offer.isExpiredForStudents()).toBe(false);
        offer.expire();
        expect(offer.isExpiredForGraduates()).toBe(true);
        expect(offer.isExpiredForStudents()).toBe(false);
      });

      it("expires only for graduates when is approved for graduates and rejected for students", async () => {
        const offer = new Offer({
          ...mandatoryAttributes,
          graduadosApprovalStatus: ApprovalStatus.approved,
          extensionApprovalStatus: ApprovalStatus.rejected,
          targetApplicantType: ApplicantType.both,
          graduatesExpirationDateTime: DateTimeManager.daysFromNow(15)
        });

        expect(offer.isExpiredForGraduates()).toBe(false);
        expect(offer.isExpiredForStudents()).toBe(false);
        offer.expire();
        expect(offer.isExpiredForGraduates()).toBe(true);
        expect(offer.isExpiredForStudents()).toBe(false);
      });

      it("expires only for students when is approved for students and pending for graduates", async () => {
        const offer = new Offer({
          ...mandatoryAttributes,
          graduadosApprovalStatus: ApprovalStatus.pending,
          extensionApprovalStatus: ApprovalStatus.approved,
          targetApplicantType: ApplicantType.both,
          studentsExpirationDateTime: DateTimeManager.daysFromNow(15)
        });

        expect(offer.isExpiredForGraduates()).toBe(false);
        expect(offer.isExpiredForStudents()).toBe(false);
        offer.expire();
        expect(offer.isExpiredForGraduates()).toBe(false);
        expect(offer.isExpiredForStudents()).toBe(true);
      });

      it("expires only for students when is approved for students and rejected for graduates", async () => {
        const offer = new Offer({
          ...mandatoryAttributes,
          graduadosApprovalStatus: ApprovalStatus.rejected,
          extensionApprovalStatus: ApprovalStatus.approved,
          targetApplicantType: ApplicantType.both,
          studentsExpirationDateTime: DateTimeManager.daysFromNow(15)
        });

        expect(offer.isExpiredForGraduates()).toBe(false);
        expect(offer.isExpiredForStudents()).toBe(false);
        offer.expire();
        expect(offer.isExpiredForGraduates()).toBe(false);
        expect(offer.isExpiredForStudents()).toBe(true);
      });
    });

    it("does not update the expiration date if the offer for student is pending", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.pending,
        targetApplicantType: ApplicantType.student
      });

      expect(offer.studentsExpirationDateTime).toBeUndefined();
      offer.expire();
      expect(offer.studentsExpirationDateTime).toBeUndefined();
    });

    it("does not update the expiration date if the offer for graduates is pending", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        graduadosApprovalStatus: ApprovalStatus.pending,
        targetApplicantType: ApplicantType.student
      });

      expect(offer.graduatesExpirationDateTime).toBeUndefined();
      offer.expire();
      expect(offer.graduatesExpirationDateTime).toBeUndefined();
    });

    it("does not update the expiration date if the offer for student is rejected", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.rejected,
        targetApplicantType: ApplicantType.student
      });

      expect(offer.studentsExpirationDateTime).toBeUndefined();
      offer.expire();
      expect(offer.studentsExpirationDateTime).toBeUndefined();
    });

    it("does not update the expiration date if the offer for graduates is pending", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        graduadosApprovalStatus: ApprovalStatus.rejected,
        targetApplicantType: ApplicantType.student
      });

      expect(offer.graduatesExpirationDateTime).toBeUndefined();
      offer.expire();
      expect(offer.graduatesExpirationDateTime).toBeUndefined();
    });

    it("does not update the expiration date if the offer for both is pending", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.pending,
        graduadosApprovalStatus: ApprovalStatus.pending,
        targetApplicantType: ApplicantType.both
      });

      expect(offer.graduatesExpirationDateTime).toBeUndefined();
      expect(offer.studentsExpirationDateTime).toBeUndefined();
      offer.expire();
      expect(offer.graduatesExpirationDateTime).toBeUndefined();
      expect(offer.studentsExpirationDateTime).toBeUndefined();
    });

    it("does not update the expiration date if the offer for both is rejected", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.rejected,
        graduadosApprovalStatus: ApprovalStatus.rejected,
        targetApplicantType: ApplicantType.both
      });

      expect(offer.graduatesExpirationDateTime).toBeUndefined();
      expect(offer.studentsExpirationDateTime).toBeUndefined();
      offer.expire();
      expect(offer.graduatesExpirationDateTime).toBeUndefined();
      expect(offer.studentsExpirationDateTime).toBeUndefined();
    });
  });

  describe("getStatus", () => {
    it("returns the status that the extension admin cares", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        graduadosApprovalStatus: ApprovalStatus.rejected
      });
      expect(offer.getStatus(Secretary.extension)).toEqual(ApprovalStatus.approved);
    });

    it("returns the status that the extension admin cares", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        graduadosApprovalStatus: ApprovalStatus.rejected
      });
      expect(offer.getStatus(Secretary.graduados)).toEqual(ApprovalStatus.rejected);
    });
  });

  describe("updateStatus", () => {
    const createOfferWith = (admin: Admin, status: ApprovalStatus) => {
      const companyUuid = UUID.generate();
      const statusAttribute =
        admin.secretary === Secretary.graduados
          ? "graduadosApprovalStatus"
          : "extensionApprovalStatus";
      const offer = new Offer(OfferGenerator.data.withObligatoryData({ companyUuid }));
      offer[statusAttribute] = status;
      return offer;
    };

    const offerDurationInDays = 15;
    const expirationDate = DateTimeManager.daysFromNow(offerDurationInDays);

    let extensionAdmin: Admin;
    let graduadosAdmin: Admin;
    let approvedOfferForGraduados: Offer;
    let rejectedOfferForGraduados: Offer;
    let pendingOfferForGraduados: Offer;

    let approvedOfferForExtension: Offer;
    let rejectedOfferForExtension: Offer;
    let pendingOfferForExtension: Offer;

    beforeAll(() => {
      extensionAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
      graduadosAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.graduados });
      approvedOfferForGraduados = createOfferWith(graduadosAdmin, ApprovalStatus.approved);
      rejectedOfferForGraduados = createOfferWith(graduadosAdmin, ApprovalStatus.rejected);
      pendingOfferForGraduados = createOfferWith(graduadosAdmin, ApprovalStatus.pending);

      approvedOfferForExtension = createOfferWith(extensionAdmin, ApprovalStatus.approved);
      rejectedOfferForExtension = createOfferWith(extensionAdmin, ApprovalStatus.rejected);
      pendingOfferForExtension = createOfferWith(extensionAdmin, ApprovalStatus.pending);
    });

    beforeEach(() => {
      jest.spyOn(DateTimeManager, "daysFromNow").mockImplementation(() => expirationDate);
    });

    it("update extension status", async () => {
      const offer = new Offer(mandatoryAttributes);
      expect(offer.extensionApprovalStatus).toEqual(ApprovalStatus.pending);
      offer.updateStatus(extensionAdmin, ApprovalStatus.approved, offerDurationInDays);
      expect(offer.extensionApprovalStatus).toEqual(ApprovalStatus.approved);
    });

    it("update graduados status", async () => {
      const offer = new Offer(mandatoryAttributes);
      expect(offer.graduadosApprovalStatus).toEqual(ApprovalStatus.pending);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.approved, offerDurationInDays);
      expect(offer.graduadosApprovalStatus).toEqual(ApprovalStatus.approved);
    });

    it("updates expiration date when approving an offer for graduados", async () => {
      const status = ApprovalStatus.approved;
      approvedOfferForGraduados.updateStatus(graduadosAdmin, status, offerDurationInDays);
      const expirationDateTime = approvedOfferForGraduados.graduatesExpirationDateTime?.toISOString();
      expect(expirationDateTime).toEqual(expirationDate.toISOString());
    });

    it("sets to null the expiration date when rejecting an offer for graduados", async () => {
      const status = ApprovalStatus.rejected;
      rejectedOfferForGraduados.updateStatus(graduadosAdmin, status, offerDurationInDays);
      expect(rejectedOfferForGraduados.graduatesExpirationDateTime).toBeNull();
    });

    it("sets to null the expiration date when moving to pending an offer for graduados", async () => {
      const status = ApprovalStatus.pending;
      pendingOfferForGraduados.updateStatus(graduadosAdmin, status, offerDurationInDays);
      expect(pendingOfferForGraduados.graduatesExpirationDateTime).toBeNull();
    });

    it("updates the expiration date when approving an offer for extension", async () => {
      const status = ApprovalStatus.approved;
      approvedOfferForExtension.updateStatus(extensionAdmin, status, offerDurationInDays);
      const expirationDateTime = approvedOfferForExtension.studentsExpirationDateTime?.toISOString();
      expect(expirationDateTime).toEqual(expirationDate.toISOString());
    });

    it("sets to null the expiration date when rejecting an offer for extension", async () => {
      const status = ApprovalStatus.rejected;
      rejectedOfferForExtension.updateStatus(extensionAdmin, status, offerDurationInDays);
      expect(rejectedOfferForExtension.studentsExpirationDateTime).toBeNull();
    });

    it("sets to null the expiration date when moving to pending an offer for extension", async () => {
      const status = ApprovalStatus.pending;
      pendingOfferForExtension.updateStatus(extensionAdmin, status, offerDurationInDays);
      expect(pendingOfferForExtension.studentsExpirationDateTime).toBeNull();
    });
  });

  describe("validateGraduatesExpirationDates", () => {
    it("does not throw an error if an approved offer have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        graduatesExpirationDateTime: DateTimeManager.daysFromNow(19),
        graduadosApprovalStatus: ApprovalStatus.approved
      });
      await expect(offer.validate()).resolves.not.toThrowError();
    });

    it("does not throw an error if a pending offer does not have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        graduatesExpirationDateTime: null,
        graduadosApprovalStatus: ApprovalStatus.pending
      });
      await expect(offer.validate()).resolves.not.toThrowError();
    });

    it("does not throw an error if a rejected offer does not have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        graduatesExpirationDateTime: null,
        graduadosApprovalStatus: ApprovalStatus.rejected
      });
      await expect(offer.validate()).resolves.not.toThrowError();
    });

    it("throws an error if an approved offer does not have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        graduatesExpirationDateTime: null,
        graduadosApprovalStatus: ApprovalStatus.approved
      });
      await expect(offer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        ApprovedOfferWithNoExpirationTimeError.buildMessage()
      );
    });

    it("throws an error if a pending offer have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        graduatesExpirationDateTime: DateTimeManager.yesterday(),
        graduadosApprovalStatus: ApprovalStatus.pending
      });
      await expect(offer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        PendingOfferWithExpirationTimeError.buildMessage()
      );
    });

    it("throws an error if a rejected offer have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        graduatesExpirationDateTime: DateTimeManager.yesterday(),
        graduadosApprovalStatus: ApprovalStatus.rejected
      });
      await expect(offer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        RejectedOfferWithExpirationTimeError.buildMessage()
      );
    });
  });

  describe("validateStudentsExpirationDates", () => {
    it("does not throw an error if an approved offer have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        studentsExpirationDateTime: DateTimeManager.daysFromNow(19),
        extensionApprovalStatus: ApprovalStatus.approved
      });
      await expect(offer.validate()).resolves.not.toThrowError();
    });

    it("does not throw an error if a pending offer does not have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        studentsExpirationDateTime: null,
        extensionApprovalStatus: ApprovalStatus.pending
      });
      await expect(offer.validate()).resolves.not.toThrowError();
    });

    it("does not throw an error if a rejected offer does not have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        studentsExpirationDateTime: null,
        extensionApprovalStatus: ApprovalStatus.rejected
      });
      await expect(offer.validate()).resolves.not.toThrowError();
    });

    it("throws an error if an approved offer does not have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        studentsExpirationDateTime: null,
        extensionApprovalStatus: ApprovalStatus.approved
      });
      await expect(offer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        ApprovedOfferWithNoExpirationTimeError.buildMessage()
      );
    });

    it("throws an error if a pending offer have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        studentsExpirationDateTime: DateTimeManager.yesterday(),
        extensionApprovalStatus: ApprovalStatus.pending
      });
      await expect(offer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        PendingOfferWithExpirationTimeError.buildMessage()
      );
    });

    it("throws an error if a rejected offer have an expiration time", async () => {
      const offer = new Offer({
        ...mandatoryAttributes,
        studentsExpirationDateTime: DateTimeManager.yesterday(),
        extensionApprovalStatus: ApprovalStatus.rejected
      });
      await expect(offer.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        RejectedOfferWithExpirationTimeError.buildMessage()
      );
    });
  });

  it("throws an error if offer does not belong to any company", async () => {
    const offer = new Offer(offerWithoutProperty("companyUuid"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer does not has a title", async () => {
    const offer = new Offer(offerWithoutProperty("title"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer does not has a description", async () => {
    const offer = new Offer(offerWithoutProperty("description"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer does not has a hoursPerDay", async () => {
    const offer = new Offer(offerWithoutProperty("hoursPerDay"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer has negative hoursPerDay", async () => {
    const offer = new Offer({ ...mandatoryAttributes, hoursPerDay: -23 });
    await expect(offer.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("throws an error if offer has hoursPerDay bigger than 24", async () => {
    const offer = new Offer({ ...mandatoryAttributes, hoursPerDay: 25 });
    await expect(offer.validate()).rejects.toThrow(NumberIsTooLargeError.buildMessage(24, true));
  });

  it("throws an error if offer does not has a minimumSalary", async () => {
    const offer = new Offer(offerWithoutProperty("minimumSalary"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer has negative minimumSalary", async () => {
    const offer = new Offer({ ...mandatoryAttributes, minimumSalary: -23 });
    await expect(offer.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("throws an error if offer has negative maximumSalary", async () => {
    const offer = new Offer({ ...mandatoryAttributes, maximumSalary: -23 });
    await expect(offer.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("throws an error if minimumSalary if bigger than maximumSalary", async () => {
    const offer = new Offer({
      ...mandatoryAttributes,
      minimumSalary: 100,
      maximumSalary: 50
    });
    await expect(offer.validate()).rejects.toThrow(SalaryRangeError.buildMessage());
  });

  it("throws an error if it's an internship that targets graduates", async () => {
    const offer = new Offer({
      ...mandatoryAttributes,
      isInternship: true,
      maximumSalary: null,
      targetApplicantType: ApplicantType.graduate
    });
    await expect(offer.validate()).rejects.toThrow(
      InternshipsMustTargetStudentsError.buildMessage()
    );
  });

  it("throws an error if it's an internship that targets both", async () => {
    const offer = new Offer({
      ...mandatoryAttributes,
      isInternship: true,
      maximumSalary: null,
      targetApplicantType: ApplicantType.both
    });
    await expect(offer.validate()).rejects.toThrow(
      InternshipsMustTargetStudentsError.buildMessage()
    );
  });

  it("throws an error if it's an internship with a maximum salary", async () => {
    const offer = new Offer({
      ...mandatoryAttributes,
      isInternship: true,
      maximumSalary: 123,
      targetApplicantType: ApplicantType.student
    });
    await expect(offer.validate()).rejects.toThrow(
      InternshipsCannotHaveMaximumSalaryError.buildMessage()
    );
  });

  it("throws an error if graduadosApprovalStatus isn't a ApprovalStatus enum value", async () => {
    const offer = new Offer({
      ...mandatoryAttributes,
      graduadosApprovalStatus: "pepito"
    });
    await expect(offer.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isApprovalStatus.validate.isIn.msg
    );
  });

  it("throws an error if targetApplicantType isn not a ApplicantType enum value", async () => {
    const offer = new Offer({
      ...mandatoryAttributes,
      targetApplicantType: "undefinedTargetApplicantType"
    });
    await expect(offer.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isTargetApplicantType.validate.isIn.msg
    );
  });
});
