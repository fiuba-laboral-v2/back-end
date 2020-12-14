import { UUID } from "$models/UUID";
import { ApprovedProfileCompanyNotification } from "$models/CompanyNotification";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";

describe("ApprovedProfileCompanyNotification", () => {
  const mandatoryAttributes = {
    moderatorUuid: UUID.generate(),
    notifiedCompanyUuid: UUID.generate()
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(() => new ApprovedProfileCompanyNotification(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  const expectToThrowErrorOnUuidInvalidFormat = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: "invalidFormat" };
    expect(() => new ApprovedProfileCompanyNotification(attributes)).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage(attributeName)
    );
  };

  it("creates a valid notification with only mandatory attributes", async () => {
    const notification = new ApprovedProfileCompanyNotification(mandatoryAttributes);
    expect(notification).toBeObjectContaining(mandatoryAttributes);
  });

  it("creates a valid notification with a createdAt timestamp", () => {
    const createdAt = new Date();
    const attributes = { ...mandatoryAttributes, createdAt };
    const notification = new ApprovedProfileCompanyNotification(attributes);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("creates a valid notification with an uuid", () => {
    const uuid = UUID.generate();
    const attributes = { uuid, ...mandatoryAttributes };
    const notification = new ApprovedProfileCompanyNotification(attributes);
    expect(notification.uuid).toEqual(uuid);
  });

  it("creates a valid notification with an undefined uuid", () => {
    const notification = new ApprovedProfileCompanyNotification(mandatoryAttributes);
    expect(notification.uuid).toBeUndefined();
  });

  it("creates a valid notification with an undefined createdAt timestamp", () => {
    const notification = new ApprovedProfileCompanyNotification(mandatoryAttributes);
    expect(notification.createdAt).toBeUndefined();
  });

  it("creates a valid notification with isNew in true as default", () => {
    const notification = new ApprovedProfileCompanyNotification(mandatoryAttributes);
    expect(notification.isNew).toBe(true);
  });

  it("sets its createdAt timestamp", async () => {
    const createdAt = new Date();
    const notification = new ApprovedProfileCompanyNotification(mandatoryAttributes);
    notification.setCreatedAt(createdAt);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its uuid", async () => {
    const uuid = UUID.generate();
    const notification = new ApprovedProfileCompanyNotification(mandatoryAttributes);
    notification.setUuid(uuid);
    expect(notification.uuid).toEqual(uuid);
  });

  it("throws an error if it is set an uuid has invalid format", async () => {
    const notification = new ApprovedProfileCompanyNotification(mandatoryAttributes);
    expect(() => notification.setUuid("invalidFormat")).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
  });

  it("throws an error if no moderatorUuid is provided", async () => {
    expectToThrowErrorOnMissingAttribute("moderatorUuid");
  });

  it("throws an error if no notifiedCompanyUuid is provided", async () => {
    expectToThrowErrorOnMissingAttribute("notifiedCompanyUuid");
  });

  it("throws an error if uuid has invalid format", async () => {
    expectToThrowErrorOnUuidInvalidFormat("uuid");
  });

  it("throws an error if moderatorUuid has invalid format", async () => {
    expectToThrowErrorOnUuidInvalidFormat("moderatorUuid");
  });

  it("throws an error if notifiedCompanyUuid has invalid format", async () => {
    expectToThrowErrorOnUuidInvalidFormat("notifiedCompanyUuid");
  });
});
