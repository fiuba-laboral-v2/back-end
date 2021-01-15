import { UUID } from "$models/UUID";
import { ApprovedOfferCompanyNotification } from "$models/CompanyNotification";
import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { omit } from "lodash";
import { Secretary } from "$models/Admin";

describe("ApprovedOfferCompanyNotification", () => {
  const mandatoryAttributes = {
    moderatorUuid: UUID.generate(),
    notifiedCompanyUuid: UUID.generate(),
    offerUuid: UUID.generate(),
    isNew: false,
    secretary: Secretary.extension
  };

  const expectToThrowErrorOnMissingAttribute = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: undefined };
    expect(() => new ApprovedOfferCompanyNotification(attributes)).toThrowErrorWithMessage(
      AttributeNotDefinedError,
      AttributeNotDefinedError.buildMessage(attributeName)
    );
  };

  const expectToThrowErrorOnUuidInvalidFormat = (attributeName: string) => {
    const attributes = { ...mandatoryAttributes, [attributeName]: "invalidFormat" };
    expect(() => new ApprovedOfferCompanyNotification(attributes)).toThrowErrorWithMessage(
      InvalidAttributeFormatError,
      InvalidAttributeFormatError.buildMessage(attributeName)
    );
  };

  it("creates a valid notification with only mandatory attributes", async () => {
    const notification = new ApprovedOfferCompanyNotification(mandatoryAttributes);
    expect(notification).toEqual({ uuid: undefined, ...mandatoryAttributes, createdAt: undefined });
  });

  it("creates a valid notification with all attributes", async () => {
    const attributes = { uuid: UUID.generate(), ...mandatoryAttributes, createdAt: new Date() };
    const notification = new ApprovedOfferCompanyNotification(attributes);
    expect(notification).toEqual(attributes);
  });

  it("creates a valid notification with isNew set to true as default if it is not provided", async () => {
    const notification = new ApprovedOfferCompanyNotification(omit(mandatoryAttributes, "isNew"));
    expect(notification.isNew).toBe(true);
  });

  it("creates a valid notification with an uuid", async () => {
    const uuid = UUID.generate();
    const notification = new ApprovedOfferCompanyNotification({ uuid, ...mandatoryAttributes });
    expect(notification).toEqual({ uuid, ...mandatoryAttributes, createdAt: undefined });
  });

  it("creates a valid notification with a createdAt timestamp", async () => {
    const createdAt = new Date();
    const notification = new ApprovedOfferCompanyNotification({
      ...mandatoryAttributes,
      createdAt
    });
    expect(notification).toEqual({ uuid: undefined, ...mandatoryAttributes, createdAt });
  });

  it("sets its createdAt timestamp", async () => {
    const createdAt = new Date();
    const notification = new ApprovedOfferCompanyNotification(mandatoryAttributes);
    notification.setCreatedAt(createdAt);
    expect(notification.createdAt).toEqual(createdAt);
  });

  it("sets its uuid", async () => {
    const uuid = UUID.generate();
    const notification = new ApprovedOfferCompanyNotification(mandatoryAttributes);
    notification.setUuid(uuid);
    expect(notification.uuid).toEqual(uuid);
  });

  it("throws an error if it is set an uuid has invalid format", async () => {
    const notification = new ApprovedOfferCompanyNotification(mandatoryAttributes);
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

  it("throws an error if no offerUuid is provided", async () => {
    expectToThrowErrorOnMissingAttribute("offerUuid");
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
