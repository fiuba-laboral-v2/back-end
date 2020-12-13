import { NumberIsTooSmallError, SalaryRangeError } from "validations-fiuba-laboral-v2";
import { ValidationError } from "sequelize";
import { Admin, Offer } from "$models";
import { ApplicantType } from "$models/Applicant";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isApprovalStatus, isTargetApplicantType } from "$models/SequelizeModelValidators";
import { omit } from "lodash";
import { Secretary } from "$models/Admin";
import { UUID } from "$models/UUID";
import { OfferGenerator } from "$generators/Offer";
import { DateTimeManager } from "$libs/DateTimeManager";
import { InternshipsCannotHaveMaximumSalaryError } from "$models/Offer/Errors/InternshipsCannotHaveMaximumSalaryError";
import { InternshipsMustTargetStudentsError } from "$models/Offer/Errors/InternshipsMustTargetStudentsError";

describe("Offer", () => {
  const offerAttributes = {
    companyUuid: UUID.generate(),
    title: "title",
    description: "description",
    isInternship: false,
    hoursPerDay: 8,
    minimumSalary: 52500,
    maximumSalary: 70000,
    graduatesExpirationDateTime: DateTimeManager.daysFromNow(7),
    studentsExpirationDateTime: DateTimeManager.daysFromNow(7),
    targetApplicantType: ApplicantType.both
  };

  const offerWithoutProperty = (property: string) => omit(offerAttributes, property);

  const createsAValidOfferWithTarget = async (targetApplicantType: ApplicantType) => {
    const offer = new Offer({ ...offerAttributes, targetApplicantType });
    await expect(offer.validate()).resolves.not.toThrow();
  };

  it("creates a valid non-internship with maximum salary", async () => {
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid non-internship without maximum salary", async () => {
    const offer = new Offer({ ...offerAttributes, maximumSalary: null });
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid internship", async () => {
    const offer = new Offer({
      ...offerAttributes,
      isInternship: true,
      maximumSalary: null,
      targetApplicantType: ApplicantType.student
    });
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid offer with its given attributes", async () => {
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
    expect(offer).toBeObjectContaining({
      ...offerAttributes,
      graduatesExpirationDateTime: offerAttributes.graduatesExpirationDateTime.toDate(),
      studentsExpirationDateTime: offerAttributes.studentsExpirationDateTime.toDate()
    });
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
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
    expect(offer.extensionApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("creates a valid offer with default graduadosApprovalStatus", async () => {
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
    expect(offer.graduadosApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("creates a valid offer without graduatesExpirationDateTime", async () => {
    const offer = new Offer(omit(offerAttributes, ["graduatesExpirationDateTime"]));
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid offer without studentsExpirationDateTime", async () => {
    const offer = new Offer(omit(offerAttributes, ["studentsExpirationDateTime"]));
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid offer with studentsExpirationDateTime and graduatesExpirationDateTime undefined when omitted", async () => {
    const offer = new Offer(
      omit(offerAttributes, ["studentsExpirationDateTime", "graduatesExpirationDateTime"])
    );

    expect(offer.studentsExpirationDateTime).toBeUndefined();
    expect(offer.graduatesExpirationDateTime).toBeUndefined();
  });

  it("has a function to know if the graduatesExpirationDateTime has expired", async () => {
    const offer = new Offer(offerAttributes);
    const expiredOffer = new Offer({
      ...offerAttributes,
      graduatesExpirationDateTime: DateTimeManager.yesterday()
    });

    expect(offer.isExpiredForGraduates()).toBe(false);
    expect(expiredOffer.isExpiredForGraduates()).toBe(true);
  });

  it("has a function to know if the studentsExpirationDateTime has expired", async () => {
    const offer = new Offer(offerAttributes);
    const expiredOffer = new Offer({
      ...offerAttributes,
      studentsExpirationDateTime: DateTimeManager.yesterday()
    });

    expect(offer.isExpiredForStudents()).toBe(false);
    expect(expiredOffer.isExpiredForStudents()).toBe(true);
  });

  it("has a function to expire studentsExpirationDateTime", async () => {
    const offer = new Offer(offerAttributes);

    expect(offer.isExpiredForStudents()).toBe(false);
    offer.expireForStudents();
    expect(offer.isExpiredForStudents()).toBe(true);
  });

  it("has a function to expire graduatesExpirationDateTime", async () => {
    const offer = new Offer(offerAttributes);

    expect(offer.isExpiredForGraduates()).toBe(false);
    offer.expireForGraduates();
    expect(offer.isExpiredForGraduates()).toBe(true);
  });

  it("has a function to expire the current Applicant Type expiration date", async () => {
    const offerForBoth = new Offer({ ...offerAttributes, targetApplicantType: ApplicantType.both });
    const offerForStudents = new Offer(
      omit(
        { ...offerAttributes, targetApplicantType: ApplicantType.student },
        "graduatesExpirationDateTime"
      )
    );
    const offerForGraduates = new Offer(
      omit(
        { ...offerAttributes, targetApplicantType: ApplicantType.graduate },
        "studentsExpirationDateTime"
      )
    );

    offerForBoth.expire();
    offerForStudents.expire();
    offerForGraduates.expire();

    expect(offerForBoth.isExpiredForGraduates()).toBe(true);
    expect(offerForBoth.isExpiredForStudents()).toBe(true);

    expect(offerForStudents.isExpiredForGraduates()).toBe(false);
    expect(offerForStudents.isExpiredForStudents()).toBe(true);

    expect(offerForGraduates.isExpiredForGraduates()).toBe(true);
    expect(offerForGraduates.isExpiredForStudents()).toBe(false);
  });

  describe("getStatus", () => {
    it("returns the status that the extension admin cares", async () => {
      const offer = new Offer({
        ...offerAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        graduadosApprovalStatus: ApprovalStatus.rejected
      });
      expect(offer.getStatus(Secretary.extension)).toEqual(ApprovalStatus.approved);
    });

    it("returns the status that the extension admin cares", async () => {
      const offer = new Offer({
        ...offerAttributes,
        extensionApprovalStatus: ApprovalStatus.approved,
        graduadosApprovalStatus: ApprovalStatus.rejected
      });
      expect(offer.getStatus(Secretary.graduados)).toEqual(ApprovalStatus.rejected);
    });
  });

  describe("updateStatus", () => {
    let extensionAdmin: Admin;
    let graduadosAdmin: Admin;

    beforeAll(() => {
      extensionAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.extension });
      graduadosAdmin = new Admin({ userUuid: UUID.generate(), secretary: Secretary.graduados });
    });

    it("update extension status", async () => {
      const offer = new Offer(offerAttributes);
      expect(offer.extensionApprovalStatus).toEqual(ApprovalStatus.pending);
      offer.updateStatus(extensionAdmin, ApprovalStatus.approved);
      expect(offer.extensionApprovalStatus).toEqual(ApprovalStatus.approved);
    });

    it("update graduados status", async () => {
      const offer = new Offer(offerAttributes);
      expect(offer.graduadosApprovalStatus).toEqual(ApprovalStatus.pending);
      offer.updateStatus(graduadosAdmin, ApprovalStatus.approved);
      expect(offer.graduadosApprovalStatus).toEqual(ApprovalStatus.approved);
    });
  });

  describe("updateExpirationDate", () => {
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

    it("updates expiration date for an approved offer for graduados", async () => {
      approvedOfferForGraduados.updateExpirationDate(graduadosAdmin, offerDurationInDays);
      const expirationDateTime = approvedOfferForGraduados.graduatesExpirationDateTime.toISOString();
      expect(expirationDateTime).toEqual(expirationDate.toISOString());
    });

    it("updates expiration date for a rejected offer for graduados", async () => {
      rejectedOfferForGraduados.updateExpirationDate(graduadosAdmin, offerDurationInDays);
      expect(rejectedOfferForGraduados.graduatesExpirationDateTime).toBeNull();
    });

    it("updates expiration date for a pending offer for graduados", async () => {
      pendingOfferForGraduados.updateExpirationDate(graduadosAdmin, offerDurationInDays);
      expect(pendingOfferForGraduados.graduatesExpirationDateTime).toBeNull();
    });

    it("updates expiration date for an approved offer for extension", async () => {
      approvedOfferForExtension.updateExpirationDate(extensionAdmin, offerDurationInDays);
      const expirationDateTime = approvedOfferForExtension.studentsExpirationDateTime.toISOString();
      expect(expirationDateTime).toEqual(expirationDate.toISOString());
    });

    it("updates expiration date for a rejected offer for extension", async () => {
      rejectedOfferForExtension.updateExpirationDate(extensionAdmin, offerDurationInDays);
      expect(rejectedOfferForExtension.studentsExpirationDateTime).toBeNull();
    });

    it("updates expiration date for a pending offer for extension", async () => {
      pendingOfferForExtension.updateExpirationDate(extensionAdmin, offerDurationInDays);
      expect(pendingOfferForExtension.studentsExpirationDateTime).toBeNull();
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
    const offer = new Offer({ ...offerAttributes, hoursPerDay: -23 });
    await expect(offer.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("throws an error if offer does not has a minimumSalary", async () => {
    const offer = new Offer(offerWithoutProperty("minimumSalary"));
    await expect(offer.validate()).rejects.toThrow();
  });

  it("throws an error if offer has negative minimumSalary", async () => {
    const offer = new Offer({ ...offerAttributes, minimumSalary: -23 });
    await expect(offer.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("throws an error if offer has negative maximumSalary", async () => {
    const offer = new Offer({ ...offerAttributes, maximumSalary: -23 });
    await expect(offer.validate()).rejects.toThrow(NumberIsTooSmallError.buildMessage(0, false));
  });

  it("throws an error if minimumSalary if bigger than maximumSalary", async () => {
    const offer = new Offer({
      ...offerAttributes,
      minimumSalary: 100,
      maximumSalary: 50
    });
    await expect(offer.validate()).rejects.toThrow(SalaryRangeError.buildMessage());
  });

  it("throws an error if it's an internship that doesn't target students", async () => {
    const offer = new Offer({
      ...offerAttributes,
      isInternship: true,
      maximumSalary: null,
      targetApplicantType: ApplicantType.graduate
    });
    await expect(offer.validate()).rejects.toThrow(
      InternshipsMustTargetStudentsError.buildMessage()
    );
  });

  it("throws an error if it's an internship with a maximum salary", async () => {
    const offer = new Offer({
      ...offerAttributes,
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
      ...offerAttributes,
      graduadosApprovalStatus: "pepito"
    });
    await expect(offer.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isApprovalStatus.validate.isIn.msg
    );
  });

  it("throws an error if targetApplicantType isn not a ApplicantType enum value", async () => {
    const offer = new Offer({
      ...offerAttributes,
      targetApplicantType: "undefinedTargetApplicantType"
    });
    await expect(offer.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isTargetApplicantType.validate.isIn.msg
    );
  });
});
