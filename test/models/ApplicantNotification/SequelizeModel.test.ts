import { UUID } from "$models/UUID";
import { ApplicantNotificationType } from "$models/ApplicantNotification";
import { ApplicantNotificationSequelizeModel } from "$models";
import { omit } from "lodash";
import { ValidationError } from "sequelize";
import { isApplicantNotificationType, isUuid } from "$models/SequelizeModelValidators";

describe("ApplicantNotificationSequelizeModel", () => {
  const mandatoryAttributes = {
    moderatorUuid: UUID.generate(),
    type: ApplicantNotificationType.approvedJobApplication,
    notifiedApplicantUuid: UUID.generate()
  };

  const expectToThrowErrorOnMissingAttribute = async (attributeName: string) => {
    const attributes = {
      ...mandatoryAttributes,
      moderatorMessage: "message",
      jobApplicationUuid: UUID.generate()
    };
    const notification = new ApplicantNotificationSequelizeModel(omit(attributes, attributeName));
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: ApplicantNotificationSequelizeModel.${attributeName} cannot be null`
    );
  };

  const expectToThrowErrorInInvalidFormat = async (attributeName: string, message: string) => {
    const notification = new ApplicantNotificationSequelizeModel({
      ...mandatoryAttributes,
      [attributeName]: "invalidValue"
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(ValidationError, message);
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
    await expectToThrowErrorOnMissingAttribute("moderatorUuid");
  });

  it("throws an error if no type is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("type");
  });

  it("throws an error if no notifiedApplicantUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("notifiedApplicantUuid");
  });

  it("throws an error if type has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat("type", isApplicantNotificationType.validate.isIn.msg);
  });

  it("throws an error if type has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat("type", isApplicantNotificationType.validate.isIn.msg);
  });

  it("throws an error if moderatorUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat("moderatorUuid", isUuid.validate.isUUID.msg);
  });

  it("throws an error if notifiedApplicantUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat("notifiedApplicantUuid", isUuid.validate.isUUID.msg);
  });

  it("throws an error if jobApplicationUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat("jobApplicationUuid", isUuid.validate.isUUID.msg);
  });
});
