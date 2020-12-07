import { ApprovedJobApplicationApplicantNotification } from "$models/ApplicantNotification";
import { UUID } from "$models/UUID";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";

describe("ApprovedJobApplicationApplicantNotification", () => {
  const attributes = {
    moderatorUuid: UUID.generate(),
    notifiedApplicantUuid: UUID.generate(),
    jobApplicationUuid: UUID.generate()
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    expect(
      () =>
        new ApprovedJobApplicationApplicantNotification({
          ...attributes,
          [attributeName]: undefined
        })
    ).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  const expectToThrowErrorOnInvalidFormat = (attributeName: string) => {
    expect(
      () =>
        new ApprovedJobApplicationApplicantNotification({
          ...attributes,
          [attributeName]: "invalidFormat"
        })
    ).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage(attributeName)
    );
  };

  it("creates a valid notification with only mandatory the attributes", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification(attributes);
    expect(notification).toEqual({
      uuid: undefined,
      ...attributes,
      isNew: true,
      createdAt: undefined
    });
  });

  it("creates a valid notification with isNew set to true", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification(attributes);
    expect(notification.isNew).toBe(true);
  });

  it("creates a valid notification with an uuid", async () => {
    const uuid = UUID.generate();
    const notification = new ApprovedJobApplicationApplicantNotification({ uuid, ...attributes });
    expect(notification.uuid).toEqual(uuid);
  });

  it("creates a valid notification with a createdAt timestamp", async () => {
    const createdAt = new Date();
    const notification = new ApprovedJobApplicationApplicantNotification({
      ...attributes,
      createdAt
    });
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its createdAt value", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification(attributes);
    const createdAt = new Date();
    notification.setCreatedAt(createdAt);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its uuid value", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification(attributes);
    const uuid = UUID.generate();
    notification.setUuid(uuid);
    expect(notification.uuid).toEqual(uuid);
  });

  it("throws an error if it is set an uuid has invalid format", async () => {
    const notification = new ApprovedJobApplicationApplicantNotification(attributes);
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
