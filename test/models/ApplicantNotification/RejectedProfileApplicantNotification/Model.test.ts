import { RejectedProfileApplicantNotification } from "$models/ApplicantNotification";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UUID } from "$models/UUID";

describe("RejectedProfileApplicantNotification", () => {
  const mandatoryAttributes = {
    moderatorUuid: UUID.generate(),
    notifiedApplicantUuid: UUID.generate(),
    moderatorMessage: "message"
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(() => new RejectedProfileApplicantNotification(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  const expectToThrowErrorOnInvalidFormat = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: "invalidFormat" };
    expect(() => new RejectedProfileApplicantNotification(attributes)).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage(attributeName)
    );
  };

  it("creates a valid notification with only mandatory the attributes", () => {
    const notification = new RejectedProfileApplicantNotification(mandatoryAttributes);
    expect(notification).toBeObjectContaining(mandatoryAttributes);
  });

  it("creates a valid notification with an uuid", () => {
    const createdAt = new Date();
    const attributes = { ...mandatoryAttributes, createdAt };
    const notification = new RejectedProfileApplicantNotification(attributes);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("creates a valid notification with a createdAt timestamp", () => {
    const uuid = UUID.generate();
    const attributes = { uuid, ...mandatoryAttributes };
    const notification = new RejectedProfileApplicantNotification(attributes);
    expect(notification.uuid).toEqual(uuid);
  });

  it("creates a valid notification with an undefined uuid", () => {
    const notification = new RejectedProfileApplicantNotification(mandatoryAttributes);
    expect(notification.uuid).toBeUndefined();
  });

  it("creates a valid notification with an undefined createdAt timestamp", () => {
    const notification = new RejectedProfileApplicantNotification(mandatoryAttributes);
    expect(notification.createdAt).toBeUndefined();
  });

  it("creates a valid notification with isNew in true as default", () => {
    const notification = new RejectedProfileApplicantNotification(mandatoryAttributes);
    expect(notification.isNew).toBe(true);
  });

  it("sets its createdAt value", async () => {
    const createdAt = new Date();
    const notification = new RejectedProfileApplicantNotification(mandatoryAttributes);
    expect(notification.createdAt).toBeUndefined();
    notification.setCreatedAt(createdAt);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its uuid value", async () => {
    const uuid = UUID.generate();
    const notification = new RejectedProfileApplicantNotification(mandatoryAttributes);
    expect(notification.uuid).toBeUndefined();
    notification.setUuid(uuid);
    expect(notification.uuid).toEqual(uuid);
  });

  it("throws an error if an uuid with invalid format is set", async () => {
    const notification = new RejectedProfileApplicantNotification(mandatoryAttributes);
    expect(() => notification.setUuid("invalidFormat")).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
  });

  it("throws an error no moderatorMessage is provided", async () => {
    expectToThrowErrorOnMissingAttribute("moderatorMessage");
  });

  it("throws an error no moderatorUuid is provided", async () => {
    expectToThrowErrorOnMissingAttribute("moderatorUuid");
  });

  it("throws an error no notifiedApplicantUuid is provided", async () => {
    expectToThrowErrorOnMissingAttribute("notifiedApplicantUuid");
  });

  it("throws an error if uuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("uuid");
  });

  it("throws an error if moderatorUuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("moderatorUuid");
  });

  it("throws an error if notifiedApplicantUuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("notifiedApplicantUuid");
  });
});
