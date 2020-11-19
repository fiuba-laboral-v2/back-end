import { ValidationError } from "sequelize";
import { Notification } from "$models";
import { UUID } from "$models/UUID";
import { UUID_REGEX } from "$test/models";
import { isUuid } from "$models/SequelizeModelValidators";
import { MultipleTypeNotificationError, MissingNotificationTypeError } from "$models/Notification";
import lodash from "lodash";

describe("Notification", () => {
  const mandatoryAttributes = {
    userUuid: UUID.generate(),
    adminUserUuid: UUID.generate(),
    jobApplicationUuid: UUID.generate()
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

  it("is created with isNew set to true", async () => {
    const notification = new Notification(mandatoryAttributes);
    await expect(notification.validate()).resolves.not.toThrow();
    expect(notification.isNew).toBe(true);
  });

  it("throws an error if it has no type", async () => {
    const notification = new Notification({
      userUuid: UUID.generate(),
      adminUserUuid: UUID.generate()
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      MissingNotificationTypeError.buildMessage()
    );
  });

  it("it throws an error if it has more than one type", async () => {
    jest.spyOn(lodash, "compact").mockImplementation(() => Array(2).fill(UUID.generate()));
    const notification = new Notification({
      userUuid: UUID.generate(),
      adminUserUuid: UUID.generate()
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      MultipleTypeNotificationError.buildMessage()
    );
  });

  it("it throws an error if no userUuid is provided", async () => {
    const notification = new Notification({ adminUserUuid: UUID.generate() });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Notification.userUuid cannot be null"
    );
  });

  it("it throws an error if no adminUserUuid is provided", async () => {
    const notification = new Notification({ userUuid: UUID.generate() });
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
      userUuid: UUID.generate(),
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
      adminUserUuid: UUID.generate()
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });
});
