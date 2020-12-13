import { RejectedJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { UUID } from "$models/UUID";

describe("RejectedJobApplicationApplicantNotification", () => {
  const mandatoryAttributes = {
    moderatorUuid: UUID.generate(),
    notifiedApplicantUuid: UUID.generate(),
    jobApplicationUuid: UUID.generate(),
    moderatorMessage: "message"
  };

  const expectToThrowErrorOnInvalidFormat = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: "invalidFormat" };
    expect(
      () => new RejectedJobApplicationApplicantNotification(attributes)
    ).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage(attributeName)
    );
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(
      () => new RejectedJobApplicationApplicantNotification(attributes)
    ).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  it("creates a notification with the mandatory attributes", () => {
    const notification = new RejectedJobApplicationApplicantNotification(mandatoryAttributes);
    expect(notification).toEqual({
      uuid: undefined,
      ...mandatoryAttributes,
      isNew: true,
      createdAt: undefined
    });
  });

  it("creates a notification with an uuid", () => {
    const uuid = UUID.generate();
    const notification = new RejectedJobApplicationApplicantNotification({
      uuid,
      ...mandatoryAttributes
    });
    expect(notification.uuid).toEqual(uuid);
  });

  it("creates a notification with a createdAt timestamp", () => {
    const createdAt = new Date();
    const notification = new RejectedJobApplicationApplicantNotification({
      ...mandatoryAttributes,
      createdAt
    });
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("creates a valid notification with isNew set to true", async () => {
    const notification = new RejectedJobApplicationApplicantNotification(mandatoryAttributes);
    expect(notification.isNew).toBe(true);
  });

  it("sets its createdAt value", async () => {
    const createdAt = new Date();
    const notification = new RejectedJobApplicationApplicantNotification(mandatoryAttributes);
    notification.setCreatedAt(createdAt);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its uuid value", async () => {
    const uuid = UUID.generate();
    const notification = new RejectedJobApplicationApplicantNotification(mandatoryAttributes);
    notification.setUuid(uuid);
    expect(notification.uuid).toEqual(uuid);
  });

  it("throws an error if it is set an uuid has invalid format", async () => {
    const notification = new RejectedJobApplicationApplicantNotification(mandatoryAttributes);
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

  it("throws an error no jobApplicationUuid is provided", async () => {
    expectToThrowErrorOnMissingAttribute("jobApplicationUuid");
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

  it("throws an error if jobApplicationUuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("jobApplicationUuid");
  });
});
