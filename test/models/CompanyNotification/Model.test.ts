import { ValidationError } from "sequelize";
import { CompanyNotification } from "$models";
import { CompanyNotificationType } from "$models/CompanyNotification";
import { isCompanyNotificationType, isUuid } from "$models/SequelizeModelValidators";
import { UUID } from "$models/UUID";
import { omit } from "lodash";

describe("CompanyNotification", () => {
  const mandatoryAttributes = {
    moderatorUuid: UUID.generate(),
    type: CompanyNotificationType.newJobApplication,
    notifiedCompanyUuid: UUID.generate()
  };

  const expectToThrowErrorOnMissingAttribute = async (attributeName: string) => {
    const attributes = {
      moderatorUuid: UUID.generate(),
      moderatorMessage: "message",
      type: CompanyNotificationType.newJobApplication,
      notifiedCompanyUuid: UUID.generate(),
      isNew: false,
      jobApplicationUuid: UUID.generate()
    };
    const companyNotification = new CompanyNotification(omit(attributes, attributeName));
    await expect(companyNotification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: CompanyNotification.${attributeName} cannot be null`
    );
  };

  const expectToThrowErrorInInvalidFormat = async (attributeName: string, message: string) => {
    const companyNotification = new CompanyNotification({
      ...mandatoryAttributes,
      [attributeName]: "invalidValue"
    });
    await expect(companyNotification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      message
    );
  };

  it("creates a valid companyNotification", async () => {
    const attributes = {
      moderatorUuid: UUID.generate(),
      moderatorMessage: "message",
      type: CompanyNotificationType.newJobApplication,
      notifiedCompanyUuid: UUID.generate(),
      isNew: false,
      jobApplicationUuid: UUID.generate(),
      offerUuid: UUID.generate()
    };
    const companyNotification = new CompanyNotification(attributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification).toBeObjectContaining(attributes);
  });

  it("is valid without a moderatorMessage", async () => {
    const companyNotification = new CompanyNotification(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.moderatorMessage).toBeUndefined();
  });

  it("is valid without a jobApplicationUuid", async () => {
    const companyNotification = new CompanyNotification(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.jobApplicationUuid).toBeUndefined();
  });

  it("is valid without an offerUuid", async () => {
    const companyNotification = new CompanyNotification(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.offerUuid).toBeUndefined();
  });

  it("is created with isNew set to true", async () => {
    const companyNotification = new CompanyNotification(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.isNew).toBe(true);
  });

  it("throws an error if no moderatorUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("moderatorUuid");
  });

  it("throws an error if no type is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("type");
  });

  it("throws an error if no notifiedCompanyUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("notifiedCompanyUuid");
  });

  it("throws an error if type has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat("type", isCompanyNotificationType.validate.isIn.msg);
  });

  it("throws an error if moderatorUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat("moderatorUuid", isUuid.validate.isUUID.msg);
  });

  it("throws an error if notifiedCompanyUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat("notifiedCompanyUuid", isUuid.validate.isUUID.msg);
  });

  it("throws an error if jobApplicationUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat("jobApplicationUuid", isUuid.validate.isUUID.msg);
  });

  it("throws an error if offerUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat("offerUuid", isUuid.validate.isUUID.msg);
  });
});
