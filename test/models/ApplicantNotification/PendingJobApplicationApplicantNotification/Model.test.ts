import { PendingJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";

describe("PendingJobApplicationApplicantNotification", () => {
  const mandatoryAttributes = {
    moderatorUuid: UUID.generate(),
    notifiedApplicantUuid: UUID.generate(),
    jobApplicationUuid: UUID.generate()
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(
      () => new PendingJobApplicationApplicantNotification(attributes)
    ).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  const expectToThrowErrorOnInvalidFormat = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: "invalidFormat" };
    expect(
      () => new PendingJobApplicationApplicantNotification(attributes)
    ).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage(attributeName)
    );
  };

  it("creates a valid notification with only mandatory the attributes", async () => {
    const notification = new PendingJobApplicationApplicantNotification(mandatoryAttributes);
    expect(notification).toEqual({
      uuid: undefined,
      ...mandatoryAttributes,
      isNew: true,
      createdAt: undefined
    });
  });

  it("creates a valid notification with isNew set to true", async () => {
    const notification = new PendingJobApplicationApplicantNotification(mandatoryAttributes);
    expect(notification.isNew).toBe(true);
  });

  it("creates a valid notification with an uuid", async () => {
    const uuid = UUID.generate();
    const attributes = { uuid, ...mandatoryAttributes };
    const notification = new PendingJobApplicationApplicantNotification(attributes);
    expect(notification.uuid).toEqual(uuid);
  });

  it("creates a valid notification with a createdAt timestamp", async () => {
    const createdAt = new Date();
    const notification = new PendingJobApplicationApplicantNotification({
      ...mandatoryAttributes,
      createdAt
    });
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its createdAt value", async () => {
    const notification = new PendingJobApplicationApplicantNotification(mandatoryAttributes);
    const createdAt = new Date();
    notification.setCreatedAt(createdAt);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its uuid value", async () => {
    const notification = new PendingJobApplicationApplicantNotification(mandatoryAttributes);
    const uuid = UUID.generate();
    notification.setUuid(uuid);
    expect(notification.uuid).toEqual(uuid);
  });

  it("throws an error if it is set an uuid has invalid format", async () => {
    const notification = new PendingJobApplicationApplicantNotification(mandatoryAttributes);
    expect(() => notification.setUuid("invalidFormat")).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
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
