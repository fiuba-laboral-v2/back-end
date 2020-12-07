import { UUID } from "$models/UUID";
import { ApplicantNotificationType } from "$models/ApplicantNotification";
import { ApplicantNotificationSequelizeModel } from "$models";
import { isApplicantNotificationType, isUuid } from "$models/SequelizeModelValidators";
import { SequelizeModelAssertions } from "$test/models/Notification/SequelizeModelAssertions";

describe("ApplicantNotificationSequelizeModel", () => {
  const {
    expectToThrowErrorOnMissingAttribute,
    expectToThrowErrorInInvalidFormat
  } = SequelizeModelAssertions;

  const mandatoryAttributes = {
    moderatorUuid: UUID.generate(),
    type: ApplicantNotificationType.approvedJobApplication,
    notifiedApplicantUuid: UUID.generate()
  };

  it("creates a valid notification with an approvedJobApplication type", async () => {
    const attributes = {
      ...mandatoryAttributes,
      moderatorMessage: "message",
      isNew: false,
      jobApplicationUuid: UUID.generate()
    };
    const notification = new ApplicantNotificationSequelizeModel(attributes);
    await expect(notification.validate()).resolves.not.toThrowError();
    expect(notification).toBeObjectContaining({ uuid: null, ...attributes, createdAt: undefined });
  });

  it("is valid without a moderatorMessage", async () => {
    const notification = new ApplicantNotificationSequelizeModel(mandatoryAttributes);
    await expect(notification.validate()).resolves.not.toThrowError();
    expect(notification.moderatorMessage).toBeUndefined();
  });

  it("is valid without a jobApplicationUuid", async () => {
    const notification = new ApplicantNotificationSequelizeModel(mandatoryAttributes);
    await expect(notification.validate()).resolves.not.toThrowError();
    expect(notification.jobApplicationUuid).toBeUndefined();
  });

  it("is created with isNew set to true", async () => {
    const notification = new ApplicantNotificationSequelizeModel(mandatoryAttributes);
    await expect(notification.validate()).resolves.not.toThrowError();
    expect(notification.isNew).toBe(true);
  });

  it("throws an error if no moderatorUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute({
      attributeName: "moderatorUuid",
      attributes: mandatoryAttributes,
      sequelizeModelClass: ApplicantNotificationSequelizeModel
    });
  });

  it("throws an error if no type is provided", async () => {
    await expectToThrowErrorOnMissingAttribute({
      attributeName: "type",
      attributes: mandatoryAttributes,
      sequelizeModelClass: ApplicantNotificationSequelizeModel
    });
  });

  it("throws an error if no notifiedApplicantUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute({
      attributeName: "notifiedApplicantUuid",
      attributes: mandatoryAttributes,
      sequelizeModelClass: ApplicantNotificationSequelizeModel
    });
  });

  it("throws an error if type has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributeName: "type",
      message: isApplicantNotificationType.validate.isIn.msg,
      attributes: mandatoryAttributes,
      sequelizeModelClass: ApplicantNotificationSequelizeModel
    });
  });

  it("throws an error if moderatorUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributeName: "moderatorUuid",
      message: isUuid.validate.isUUID.msg,
      attributes: mandatoryAttributes,
      sequelizeModelClass: ApplicantNotificationSequelizeModel
    });
  });

  it("throws an error if notifiedApplicantUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributeName: "notifiedApplicantUuid",
      message: isUuid.validate.isUUID.msg,
      attributes: mandatoryAttributes,
      sequelizeModelClass: ApplicantNotificationSequelizeModel
    });
  });

  it("throws an error if jobApplicationUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributeName: "jobApplicationUuid",
      message: isUuid.validate.isUUID.msg,
      attributes: mandatoryAttributes,
      sequelizeModelClass: ApplicantNotificationSequelizeModel
    });
  });
});
