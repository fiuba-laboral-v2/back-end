import { UuidGenerator } from "$models/UuidGenerator";
import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";
import { UUID_REGEX } from "$test/models";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";

describe("CompanyNewJobApplicationNotification", () => {
  const attributes = {
    moderatorUuid: UuidGenerator.generate(),
    companyUuid: UuidGenerator.generate(),
    isNew: true,
    createdAt: new Date()
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
      uuid: expect.stringMatching(UUID_REGEX),
      ...attributes
    });
  });

  it("throws an error if uuid is not generated", async () => {
    jest.spyOn(UuidGenerator, "generate").mockImplementation(() => undefined as any);
    expect(() => new CompanyNewJobApplicationNotification(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage("uuid")
    );
  });

  it("throws an error if no moderatorUuid is provided", async () => {
    expectToThrowErrorOnMissingAttribute("moderatorUuid");
  });

  it("throws an error if no companyUuid is provided", async () => {
    expectToThrowErrorOnMissingAttribute("companyUuid");
  });

  it("throws an error if no isNew is provided", async () => {
    expectToThrowErrorOnMissingAttribute("isNew");
  });

  it("throws an error if no createdAt is provided", async () => {
    expectToThrowErrorOnMissingAttribute("createdAt");
  });

  it("throws an error if the generated uuid has invalid format", async () => {
    jest.spyOn(UuidGenerator, "generate").mockImplementation(() => "invalidFormat");
    expect(() => new CompanyNewJobApplicationNotification(attributes)).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage("uuid")
    );
  });

  it("throws an error if moderatorUuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("moderatorUuid");
  });

  it("throws an error if companyUuid has invalid format", async () => {
    expectToThrowErrorOnInvalidFormat("companyUuid");
  });
});
