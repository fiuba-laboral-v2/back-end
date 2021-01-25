import { NotificationEmailLog } from "$models";
import { ValidationError } from "sequelize";
import { UUID } from "$models/UUID";
import { omit } from "lodash";

describe("NotificationEmailLog", () => {
  const mandatoryAttributes = {
    notificationUuid: UUID.generate(),
    notificationTable: "AdminNotifications",
    success: true,
    message: "message"
  };

  it("creates a valid notificationEmailLog", async () => {
    const notificationEmailLog = new NotificationEmailLog(mandatoryAttributes);
    await expect(notificationEmailLog.validate()).resolves.not.toThrowError();
  });

  it("creates a valid notificationEmailLog with the correct attributes", async () => {
    const notificationEmailLog = new NotificationEmailLog(mandatoryAttributes);
    expect(notificationEmailLog).toBeObjectContaining(mandatoryAttributes);
  });

  it("creates a valid notificationEmailLog with a null uuid", async () => {
    const notificationEmailLog = new NotificationEmailLog(mandatoryAttributes);
    expect(notificationEmailLog.uuid).toBeNull();
  });

  it("creates a valid notificationEmailLog with null createdAt", async () => {
    const notificationEmailLog = new NotificationEmailLog(mandatoryAttributes);
    expect(notificationEmailLog.createdAt).toBeUndefined();
  });

  it("throws an error if no notificationUuid is provided", async () => {
    const attributes = omit(mandatoryAttributes, "notificationUuid");
    const notificationEmailLog = new NotificationEmailLog(attributes);
    await expect(notificationEmailLog.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: NotificationEmailLog.notificationUuid cannot be null"
    );
  });

  it("throws an error if no notificationTable is provided", async () => {
    const attributes = omit(mandatoryAttributes, "notificationTable");
    const notificationEmailLog = new NotificationEmailLog(attributes);
    await expect(notificationEmailLog.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: NotificationEmailLog.notificationTable cannot be null"
    );
  });

  it("throws an error if no success is provided", async () => {
    const attributes = omit(mandatoryAttributes, "success");
    const notificationEmailLog = new NotificationEmailLog(attributes);
    await expect(notificationEmailLog.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: NotificationEmailLog.success cannot be null"
    );
  });

  it("throws an error if no message is provided", async () => {
    const attributes = omit(mandatoryAttributes, "message");
    const notificationEmailLog = new NotificationEmailLog(attributes);
    await expect(notificationEmailLog.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      "notNull Violation: NotificationEmailLog.message cannot be null"
    );
  });
});
