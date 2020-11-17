import { v4 as generateUuid } from "uuid";
import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";

describe("CompanyNewJobApplicationNotification", () => {
  const attributes = {
    moderatorUuid: generateUuid(),
    notifiedCompanyUuid: generateUuid(),
    jobApplicationUuid: generateUuid(),
    isNew: true
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    expect(
      () => new CompanyNewJobApplicationNotification({ ...attributes, [attributeName]: undefined })
    ).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  const expectToThrowErrorOnInvalidFormat = (attributeName: string) => {
    expect(
      () =>
        new CompanyNewJobApplicationNotification({
          ...attributes,
          [attributeName]: "invalidFormat"
        })
    ).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage(attributeName)
    );
  };

  it("creates a valid notification", async () => {
    const notification = new CompanyNewJobApplicationNotification(attributes);
    expect(notification).toEqual({
      uuid: undefined,
      ...attributes,
      createdAt: undefined
    });
  });

  it("is created with isNew set to true", async () => {
    const notification = new CompanyNewJobApplicationNotification({
      moderatorUuid: generateUuid(),
      notifiedCompanyUuid: generateUuid(),
      jobApplicationUuid: generateUuid()
    });
    expect(notification.isNew).toBe(true);
  });

  it("sets its uuid", async () => {
    const uuid = generateUuid();
    const notification = new CompanyNewJobApplicationNotification(attributes);
    notification.setUuid(uuid);
    expect(notification.uuid).toEqual(uuid);
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

  it("throws an error if it is set an undefined createdAt", async () => {
    const notification = new CompanyNewJobApplicationNotification(attributes);
    expect(() => notification.setCreatedAt(undefined as any)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage("createdAt")
    );
  });

  it("throws an error if it is set an undefined uuid", async () => {
    const notification = new CompanyNewJobApplicationNotification(attributes);
    expect(() => notification.setUuid(undefined as any)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage("uuid")
    );
  });

  it("throws an error if it is set an uuid has invalid format", async () => {
    const notification = new CompanyNewJobApplicationNotification(attributes);
    expect(() => notification.setUuid("invalidFormat")).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
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
