import { UpdatedCompanyProfileAdminNotification } from "$models/AdminNotification";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UUID } from "$models/UUID";
import { Secretary } from "$models/Admin";

describe("UpdatedCompanyProfileAdminNotification", () => {
  const mandatoryAttributes = {
    secretary: Secretary.extension,
    companyUuid: UUID.generate()
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(() => new UpdatedCompanyProfileAdminNotification(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  const expectToThrowErrorOnInvalidFormat = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: "invalidFormat" };
    expect(() => new UpdatedCompanyProfileAdminNotification(attributes)).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage(attributeName)
    );
  };

  it("creates a valid notification with only mandatory the attributes", () => {
    const notification = new UpdatedCompanyProfileAdminNotification(mandatoryAttributes);
    expect(notification).toBeObjectContaining(mandatoryAttributes);
  });

  it("creates a valid notification with a createdAt timestamp", () => {
    const createdAt = new Date();
    const attributes = { ...mandatoryAttributes, createdAt };
    const notification = new UpdatedCompanyProfileAdminNotification(attributes);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("creates a valid notification with an uuid", () => {
    const uuid = UUID.generate();
    const attributes = { uuid, ...mandatoryAttributes };
    const notification = new UpdatedCompanyProfileAdminNotification(attributes);
    expect(notification.uuid).toEqual(uuid);
  });

  it("creates a valid notification with an undefined uuid", () => {
    const notification = new UpdatedCompanyProfileAdminNotification(mandatoryAttributes);
    expect(notification.uuid).toBeUndefined();
  });

  it("creates a valid notification with an undefined createdAt timestamp", () => {
    const notification = new UpdatedCompanyProfileAdminNotification(mandatoryAttributes);
    expect(notification.createdAt).toBeUndefined();
  });

  it("creates a valid notification with isNew in true as default", () => {
    const notification = new UpdatedCompanyProfileAdminNotification(mandatoryAttributes);
    expect(notification.isNew).toBe(true);
  });

  it("sets its createdAt value", async () => {
    const createdAt = new Date();
    const notification = new UpdatedCompanyProfileAdminNotification(mandatoryAttributes);
    expect(notification.createdAt).toBeUndefined();
    notification.setCreatedAt(createdAt);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its uuid value", async () => {
    const uuid = UUID.generate();
    const notification = new UpdatedCompanyProfileAdminNotification(mandatoryAttributes);
    expect(notification.uuid).toBeUndefined();
    notification.setUuid(uuid);
    expect(notification.uuid).toEqual(uuid);
  });

  it("throws an error if an uuid with invalid format is set", async () => {
    const notification = new UpdatedCompanyProfileAdminNotification(mandatoryAttributes);
    expect(() => notification.setUuid("invalidFormat")).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
  });

  it("throws an error no secretary is provided", async () => {
    expectToThrowErrorOnMissingAttribute("secretary");
  });

  it("throws an error no companyUuid is provided", async () => {
    expectToThrowErrorOnMissingAttribute("companyUuid");
  });

  it("throws an error if uuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("uuid");
  });

  it("throws an error if companyUuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("companyUuid");
  });

  it("throws an error if secretary has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("secretary");
  });
});
