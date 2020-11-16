import { ValidationError } from "sequelize";
import { Notification } from "$models";
import generateUuid from "uuid/v4";
import { UUID_REGEX } from "$test/models";
import { isUuid } from "$models/SequelizeModelValidators";
import { MultipleTypeNotificationError, MissingNotificationTypeError } from "$models/Notification";
import lodash from "lodash";

describe("Notification", () => {
  const mandatoryAttributes = {
    receiverUuid: generateUuid(),
    senderUuid: generateUuid(),
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

  it("is created with isNew set to true", async () => {
    const notification = new Notification(mandatoryAttributes);
    await expect(notification.validate()).resolves.not.toThrow();
    expect(notification.isNew).toBe(true);
  });

  it("throws an error if it has no type", async () => {
    const notification = new Notification({
      receiverUuid: generateUuid(),
      senderUuid: generateUuid()
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      MissingNotificationTypeError.buildMessage()
    );
  });

  it("it throws an error if it has more than one type", async () => {
    jest.spyOn(lodash, "compact").mockImplementation(() => Array(2).fill(generateUuid()));
    const notification = new Notification({
      receiverUuid: generateUuid(),
      senderUuid: generateUuid()
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      MultipleTypeNotificationError.buildMessage()
    );
  });

  it("it throws an error if no receiverUuid is provided", async () => {
    const notification = new Notification({ senderUuid: generateUuid() });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Notification.receiverUuid cannot be null"
    );
  });

  it("it throws an error if no senderUuid is provided", async () => {
    const notification = new Notification({ receiverUuid: generateUuid() });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Notification.senderUuid cannot be null"
    );
  });

  it("it throws an error if both senderUuid and receiverUuid are not provided", async () => {
    const notification = new Notification();
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: Notification.receiverUuid cannot be null,\n" +
        "notNull Violation: Notification.senderUuid cannot be null"
    );
  });

  it("it throws an error if senderUuid has invalid format", async () => {
    const notification = new Notification({
      receiverUuid: generateUuid(),
      senderUuid: "invalidUuid"
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });

  it("it throws an error if receiverUuid has invalid format", async () => {
    const notification = new Notification({
      receiverUuid: "invalidUuid",
      senderUuid: generateUuid()
    });
    await expect(notification.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  });
});
