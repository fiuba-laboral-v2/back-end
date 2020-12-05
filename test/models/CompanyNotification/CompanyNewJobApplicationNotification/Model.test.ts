import { UUID } from "$models/UUID";
import { NewJobApplicationCompanyNotification } from "$models/CompanyNotification";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";

describe("NewJobApplicationCompanyNotification", () => {
  const attributes = {
    moderatorUuid: UUID.generate(),
    notifiedCompanyUuid: UUID.generate(),
    jobApplicationUuid: UUID.generate(),
    isNew: true
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    expect(
      () => new NewJobApplicationCompanyNotification({ ...attributes, [attributeName]: undefined })
    ).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  const expectToThrowErrorOnInvalidFormat = (attributeName: string) => {
    expect(
      () =>
        new NewJobApplicationCompanyNotification({
          ...attributes,
          [attributeName]: "invalidFormat"
        })
    ).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage(attributeName)
    );
  };

  it("creates a valid notification", async () => {
    const notification = new NewJobApplicationCompanyNotification(attributes);
    expect(notification).toEqual({
      uuid: undefined,
      ...attributes,
      createdAt: undefined
    });
  });

  it("creates a valid notification with an uuid", async () => {
    const uuid = UUID.generate();
    const notification = new NewJobApplicationCompanyNotification({
      uuid,
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate()
    });
    expect(notification.uuid).toBe(uuid);
  });

  it("creates a valid notification with a createdAt", async () => {
    const createdAt = new Date();
    const notification = new NewJobApplicationCompanyNotification({
      moderatorUuid: UUID.generate(),
      notifiedCompanyUuid: UUID.generate(),
      jobApplicationUuid: UUID.generate(),
      createdAt
    });
    expect(notification.createdAt).toBe(createdAt);
  });

  it("sets its createdAt", async () => {
    const createdAt = new Date();
    const notification = new NewJobApplicationCompanyNotification(attributes);
    notification.setCreatedAt(createdAt);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its uuid", async () => {
    const uuid = UUID.generate();
    const notification = new NewJobApplicationCompanyNotification(attributes);
    notification.setUuid(uuid);
    expect(notification.uuid).toEqual(uuid);
  });

  it("throws an error if it is set an uuid has invalid format", async () => {
    const notification = new NewJobApplicationCompanyNotification(attributes);
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

  it("throws an error if no jobApplicationUuid is provided", async () => {
    expectToThrowErrorOnMissingAttribute("jobApplicationUuid");
  });

  it("throws an error if uuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("uuid");
  });

  it("throws an error if moderatorUuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("moderatorUuid");
  });

  it("throws an error if notifiedCompanyUuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("notifiedCompanyUuid");
  });

  it("throws an error if jobApplicationUuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("jobApplicationUuid");
  });
});
