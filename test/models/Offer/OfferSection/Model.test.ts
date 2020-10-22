import { ValidationError } from "sequelize";

import { OfferSection } from "$models";

import generateUuid from "uuid/v4";
import { UUID_REGEX } from "$test/models";

describe("OfferSection", () => {
  const attributes = {
    offerUuid: generateUuid(),
    title: "title",
    text: "text",
    displayOrder: 1
  };

  const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
    delete attributes[attribute];
    const section = new OfferSection(attributes);
    await expect(section.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: OfferSection.${attribute} cannot be null`
    );
  };

  it("creates a valid section", async () => {
    const section = new OfferSection(attributes);
    await expect(section.validate()).resolves.not.toThrow();
    expect(section).toHaveProperty("uuid");
    expect(section).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...attributes
    });
  });

  it("throws an error if no title is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("title");
  });

  it("throws an error if no text is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("text");
  });

  it("throws an error if no offerUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("offerUuid");
  });
});
