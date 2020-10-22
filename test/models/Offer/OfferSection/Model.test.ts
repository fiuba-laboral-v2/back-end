import { ValidationError } from "sequelize";

import { OfferSection } from "$models";

import generateUuid from "uuid/v4";
import { UUID_REGEX } from "$test/models";

describe("OfferSection", () => {
  const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
    const attributes = {
      offerUuid: generateUuid(),
      title: "title",
      text: "text",
      displayOrder: 1
    };
    delete attributes[attribute];
    const section = new OfferSection(attributes);
    await expect(section.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `notNull Violation: OfferSection.${attribute} cannot be null`
    );
  };

  it("creates a valid section", async () => {
    const sectionAttributes = {
      offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
      title: "title",
      text: "text",
      displayOrder: 1
    };
    const section = new OfferSection(sectionAttributes);
    await expect(section.validate()).resolves.not.toThrow();
    expect(section).toHaveProperty("uuid");
    expect(section).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...sectionAttributes
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
