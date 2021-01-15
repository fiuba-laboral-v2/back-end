import { RejectedOfferCompanyNotification } from "$models/CompanyNotification";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UUID } from "$models/UUID";
import { Secretary } from "$models/Admin";

describe("RejectedOfferCompanyNotification", () => {
  const mandatoryAttributes = {
    moderatorUuid: UUID.generate(),
    notifiedCompanyUuid: UUID.generate(),
    offerUuid: UUID.generate(),
    moderatorMessage: "message",
    secretary: Secretary.extension
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(() => new RejectedOfferCompanyNotification(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  const expectToThrowErrorOnUuidInvalidFormat = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: "invalidFormat" };
    expect(() => new RejectedOfferCompanyNotification(attributes)).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage(attributeName)
    );
  };

  it("creates a valid notification with the mandatory attributes", () => {
    const notification = new RejectedOfferCompanyNotification(mandatoryAttributes);
    expect(notification).toEqual({
      uuid: undefined,
      ...mandatoryAttributes,
      isNew: true,
      createdAt: undefined
    });
  });

  it("creates a valid notification with isNew set to true", async () => {
    const notification = new RejectedOfferCompanyNotification(mandatoryAttributes);
    expect(notification.isNew).toBe(true);
  });

  it("creates a notification with an uuid", async () => {
    const uuid = UUID.generate();
    const notification = new RejectedOfferCompanyNotification({ uuid, ...mandatoryAttributes });
    expect(notification.uuid).toEqual(uuid);
  });

  it("creates a notification with a createdAt timestamp", async () => {
    const createdAt = new Date();
    const attributes = { ...mandatoryAttributes, createdAt };
    const notification = new RejectedOfferCompanyNotification(attributes);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its createdAt value", async () => {
    const createdAt = new Date();
    const notification = new RejectedOfferCompanyNotification(mandatoryAttributes);
    notification.setCreatedAt(createdAt);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its uuid value", async () => {
    const uuid = UUID.generate();
    const notification = new RejectedOfferCompanyNotification(mandatoryAttributes);
    notification.setUuid(uuid);
    expect(notification.uuid).toEqual(uuid);
  });

  it("throws an error if it sets an uuid with invalid format", async () => {
    const uuid = "invalidFormat";
    const notification = new RejectedOfferCompanyNotification(mandatoryAttributes);
    expect(() => notification.setUuid(uuid)).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
  });

  it("throws an error if no moderatorUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("moderatorUuid");
  });

  it("throws an error if no notifiedCompanyUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("notifiedCompanyUuid");
  });

  it("throws an error if no offerUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("offerUuid");
  });

  it("throws an error if no moderatorMessage is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("moderatorMessage");
  });

  it("throws an error if no moderatorMessage is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("moderatorMessage");
  });

  it("throws an error if no secretary is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("secretary");
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

  it("throws an error if offerUuid has invalid format", async () => {
    expectToThrowErrorOnUuidInvalidFormat("offerUuid");
  });

  it("throws an error if secretary has invalid format", async () => {
    expectToThrowErrorOnUuidInvalidFormat("secretary");
  });
});
