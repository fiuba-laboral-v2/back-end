import { NumberIsTooSmallError, SalaryRangeError } from "validations-fiuba-laboral-v2";
import { ValidationError } from "sequelize";
import { Offer } from "$models";
import { ApplicantType } from "$models/Applicant";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { isApprovalStatus, isTargetApplicantType } from "$models/SequelizeModelValidators";
import { omit } from "lodash";

describe("Offer", () => {
  const offerAttributes = {
    companyUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
    title: "title",
    description: "description",
    hoursPerDay: 8,
    minimumSalary: 52500,
    maximumSalary: 70000,
    graduatesExpirationDateTime: "2020-10-24T15:18:06.000Z",
    studentsExpirationDateTime: "2020-10-24T15:18:06.000Z",
    targetApplicantType: ApplicantType.both
  };

  const offerWithoutProperty = async (property: string) => {
    const offerAttributesWithoutProperty = offerAttributes;
    delete offerAttributesWithoutProperty[property];
    return offerAttributesWithoutProperty;
  };

  const createsAValidOfferWithTarget = async (targetApplicantType: ApplicantType) => {
    const offer = new Offer({
      ...offerAttributes,
      targetApplicantType
    });
    await expect(offer.validate()).resolves.not.toThrow();
  };

  it("creates a valid offer", async () => {
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid offer with its given attributes", async () => {
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
    expect(offer).toBeObjectContaining({
      ...offerAttributes,
      graduatesExpirationDateTime: new Date(offerAttributes.graduatesExpirationDateTime),
      studentsExpirationDateTime: new Date(offerAttributes.studentsExpirationDateTime)
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
    await expect(offer.extensionApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("creates a valid offer with default graduadosApprovalStatus", async () => {
    const offer = new Offer(offerAttributes);
    await expect(offer.validate()).resolves.not.toThrow();
    await expect(offer.graduadosApprovalStatus).toEqual(ApprovalStatus.pending);
  });

  it("creates a valid offer without graduatesExpirationDateTime", async () => {
    const offer = new Offer(omit(offerAttributes, ["graduatesExpirationDateTime"]));
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("creates a valid offer without studentsExpirationDateTime", async () => {
    const offer = new Offer(omit(offerAttributes, ["studentsExpirationDateTime"]));
    await expect(offer.validate()).resolves.not.toThrow();
  });

  it("throws an error if offer does not belong to any company", async () => {
    const offer = new Offer({ ...offerAttributes, companyUuid: null });
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

  it("throws an error if offer does not has a maximumSalary", async () => {
    const offer = new Offer(offerWithoutProperty("maximumSalary"));
    await expect(offer.validate()).rejects.toThrow();
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
