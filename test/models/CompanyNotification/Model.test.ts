import { CompanyNotificationSequelizeModel } from "$models";
import { CompanyNotificationType } from "$models/CompanyNotification";
import { isCompanyNotificationType, isUuid, isSecretary } from "$models/SequelizeModelValidators";
import { SequelizeModelAssertions } from "../Notification/SequelizeModelAssertions";
import { UUID } from "$models/UUID";

describe("CompanyNotificationSequelizeModel", () => {
  const {
    expectToThrowErrorOnMissingAttribute,
    expectToThrowErrorInInvalidFormat
  } = SequelizeModelAssertions;

  const mandatoryAttributes = {
    moderatorUuid: UUID.generate(),
    type: CompanyNotificationType.newJobApplication,
    notifiedCompanyUuid: UUID.generate()
  };

  const newJobApplicationAttributes = {
    ...mandatoryAttributes,
    moderatorMessage: "message",
    isNew: false,
    jobApplicationUuid: UUID.generate()
  };

  it("creates a valid companyNotification with a newJobApplication type", async () => {
    const attributes = {
      ...mandatoryAttributes,
      moderatorMessage: "message",
      isNew: false,
      jobApplicationUuid: UUID.generate(),
      offerUuid: UUID.generate()
    };
    const companyNotification = new CompanyNotificationSequelizeModel(attributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification).toBeObjectContaining(attributes);
  });

  it("creates a valid companyNotification with a approvedOffer type", async () => {
    const attributes = {
      ...mandatoryAttributes,
      type: CompanyNotificationType.approvedOffer,
      moderatorMessage: "message",
      isNew: false,
      jobApplicationUuid: UUID.generate(),
      offerUuid: UUID.generate()
    };
    const companyNotification = new CompanyNotificationSequelizeModel(attributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification).toBeObjectContaining(attributes);
  });

  it("is valid without a moderatorMessage", async () => {
    const companyNotification = new CompanyNotificationSequelizeModel(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.moderatorMessage).toBeUndefined();
  });

  it("is valid without a jobApplicationUuid", async () => {
    const companyNotification = new CompanyNotificationSequelizeModel(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.jobApplicationUuid).toBeUndefined();
  });

  it("is valid without an offerUuid", async () => {
    const companyNotification = new CompanyNotificationSequelizeModel(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.offerUuid).toBeUndefined();
  });

  it("is valid without a secretary", async () => {
    const companyNotification = new CompanyNotificationSequelizeModel(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.secretary).toBeUndefined();
  });

  it("is created with isNew set to true", async () => {
    const companyNotification = new CompanyNotificationSequelizeModel(mandatoryAttributes);
    await expect(companyNotification.validate()).resolves.not.toThrowError();
    expect(companyNotification.isNew).toBe(true);
  });

  it("throws an error if no moderatorUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute({
      attributeName: "moderatorUuid",
      attributes: newJobApplicationAttributes,
      sequelizeModelClass: CompanyNotificationSequelizeModel
    });
  });

  it("throws an error if no type is provided", async () => {
    await expectToThrowErrorOnMissingAttribute({
      attributeName: "type",
      attributes: newJobApplicationAttributes,
      sequelizeModelClass: CompanyNotificationSequelizeModel
    });
  });

  it("throws an error if no notifiedCompanyUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute({
      attributeName: "notifiedCompanyUuid",
      attributes: newJobApplicationAttributes,
      sequelizeModelClass: CompanyNotificationSequelizeModel
    });
  });

  it("throws an error if type has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributes: newJobApplicationAttributes,
      attributeName: "type",
      message: isCompanyNotificationType.validate.isIn.msg,
      sequelizeModelClass: CompanyNotificationSequelizeModel
    });
  });

  it("throws an error if moderatorUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributes: newJobApplicationAttributes,
      attributeName: "moderatorUuid",
      message: isUuid.validate.isUUID.msg,
      sequelizeModelClass: CompanyNotificationSequelizeModel
    });
  });

  it("throws an error if notifiedCompanyUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributes: newJobApplicationAttributes,
      attributeName: "notifiedCompanyUuid",
      message: isUuid.validate.isUUID.msg,
      sequelizeModelClass: CompanyNotificationSequelizeModel
    });
  });

  it("throws an error if jobApplicationUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributes: newJobApplicationAttributes,
      attributeName: "jobApplicationUuid",
      message: isUuid.validate.isUUID.msg,
      sequelizeModelClass: CompanyNotificationSequelizeModel
    });
  });

  it("throws an error if offerUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributes: newJobApplicationAttributes,
      attributeName: "offerUuid",
      message: isUuid.validate.isUUID.msg,
      sequelizeModelClass: CompanyNotificationSequelizeModel
    });
  });

  it("throws an error if secretary has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributes: newJobApplicationAttributes,
      attributeName: "secretary",
      message: isSecretary.validate.isIn.msg,
      sequelizeModelClass: CompanyNotificationSequelizeModel
    });
  });
});
