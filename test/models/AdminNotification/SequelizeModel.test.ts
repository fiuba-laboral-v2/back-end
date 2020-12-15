import { UUID } from "$models/UUID";
import { AdminNotificationType } from "$models/AdminNotification";
import { AdminNotificationSequelizeModel } from "$models";
import { isAdminNotificationType, isUuid } from "$models/SequelizeModelValidators";
import { SequelizeModelAssertions } from "$test/models/Notification/SequelizeModelAssertions";
import { Secretary } from "$models/Admin";

describe("AdminNotificationSequelizeModel", () => {
  const {
    expectToThrowErrorOnMissingAttribute,
    expectToThrowErrorInInvalidFormat
  } = SequelizeModelAssertions;

  const mandatoryAttributes = {
    secretary: Secretary.extension,
    type: AdminNotificationType.updatedCompanyProfile
  };

  it("creates a valid notification with a updatedCompanyProfile type", async () => {
    const attributes = {
      ...mandatoryAttributes,
      companyUuid: UUID.generate(),
      isNew: false
    };
    const notification = new AdminNotificationSequelizeModel(attributes);
    await expect(notification.validate()).resolves.not.toThrowError();
    expect(notification).toBeObjectContaining({ uuid: null, ...attributes, createdAt: undefined });
  });

  it("is valid without a companyUuid", async () => {
    const notification = new AdminNotificationSequelizeModel(mandatoryAttributes);
    await expect(notification.validate()).resolves.not.toThrowError();
    expect(notification.companyUuid).toBeUndefined();
  });

  it("is created with isNew set to true", async () => {
    const notification = new AdminNotificationSequelizeModel(mandatoryAttributes);
    await expect(notification.validate()).resolves.not.toThrowError();
    expect(notification.isNew).toBe(true);
  });

  it("throws an error if no secretary is provided", async () => {
    await expectToThrowErrorOnMissingAttribute({
      attributeName: "secretary",
      attributes: mandatoryAttributes,
      sequelizeModelClass: AdminNotificationSequelizeModel
    });
  });

  it("throws an error if no type is provided", async () => {
    await expectToThrowErrorOnMissingAttribute({
      attributeName: "type",
      attributes: mandatoryAttributes,
      sequelizeModelClass: AdminNotificationSequelizeModel
    });
  });

  it("throws an error if type has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributeName: "type",
      message: isAdminNotificationType.validate.isIn.msg,
      attributes: mandatoryAttributes,
      sequelizeModelClass: AdminNotificationSequelizeModel
    });
  });

  it("throws an error if companyUuid has an invalid value", async () => {
    await expectToThrowErrorInInvalidFormat({
      attributeName: "companyUuid",
      message: isUuid.validate.isUUID.msg,
      attributes: mandatoryAttributes,
      sequelizeModelClass: AdminNotificationSequelizeModel
    });
  });
});
