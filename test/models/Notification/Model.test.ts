import { ValidationError } from "sequelize";
import { Notification } from "$models";
import generateUuid from "uuid/v4";
import { UUID_REGEX } from "$test/models";
import { isUuid } from "$models/SequelizeModelValidators";
import { NotificationHasNoTaskForeignKeyError } from "$models/Notification/Errors";

describe("Notification", () => {
  const mandatoryAttributes = {
    userUuid: generateUuid(),
    adminUserUuid: generateUuid(),
    jobApplicationUuid: generateUuid()
  };

  it("creates a valid notification", async () => {
    const attributes = {
      ...mandatoryAttributes,
      message: "some message",
      isNew: false
    };
    const notification = new Notification(attributes);
    await expect(notification.validate()).resolves.not.toThrow();
    expect(notification).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...attributes
    });
  });

  it("is valid without a message", async () => {
    const notification = new Notification(mandatoryAttributes);
    await expect(notification.validate()).resolves.not.toThrow();
    expect(notification.message).toBeUndefined();
  });

  it("creates a notification with isNew in true as default", async () => {
    const notification = new Notification(mandatoryAttributes);
    await expect(notification.validate()).resolves.not.toThrow();
    expect(notification.isNew).toBe(true);
  });

  it("it throws an error if it has no type", async () => {
    const notification = new Notification({
      userUuid: generateUuid(),
      adminUserUuid: generateUuid()
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      NotificationHasNoTaskForeignKeyError.buildMessage()
    );
  });

  it("it throws an error if no userUuid is provided", async () => {
    const notification = new Notification({ adminUserUuid: generateUuid() });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Notification.userUuid cannot be null"
    );
  });

  it("it throws an error if no adminUserUuid is provided", async () => {
    const notification = new Notification({ userUuid: generateUuid() });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Notification.adminUserUuid cannot be null"
    );
  });

  it("it throws an error if both adminUserUuid and userUuid are not provided", async () => {
    const notification = new Notification();
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Notification.userUuid cannot be null,\n" +
        "notNull Violation: Notification.adminUserUuid cannot be null"
    );
  });

  it("it throws an error if adminUserUuid has invalid format", async () => {
    const notification = new Notification({
      userUuid: generateUuid(),
      adminUserUuid: "invalidUuid"
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });

  it("it throws an error if userUuid has invalid format", async () => {
    const notification = new Notification({
      userUuid: "invalidUuid",
      adminUserUuid: generateUuid()
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });
});
