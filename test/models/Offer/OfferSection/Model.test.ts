import { ValidationError } from "sequelize";
import { OfferSection } from "../../../../src/models";

describe("OfferSection", () => {
  describe("Valid create", () => {
    it("should create a valid section", async () => {
      const sectionAttributes = {
        offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        title: "title",
        text: "text",
        displayOrder: 1
      };
      const section = new OfferSection(sectionAttributes);
      await expect(section.validate()).resolves.not.toThrow();
      expect(section).toHaveProperty("uuid");
      expect(section).toMatchObject(sectionAttributes);
    });
  });

  describe("Errors", () => {
    it("throws an error if no title is provided", async () => {
      const section = new OfferSection({
        offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        text: "text",
        displayOrder: 1
      });

      await expect(section.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: OfferSection.title cannot be null"
      );
    });

    it("should throw an error if no text is provided", async () => {
      const section = new OfferSection({
        offerUuid: "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da",
        title: "title",
        displayOrder: 1
      });

      await expect(section.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: OfferSection.text cannot be null"
      );
    });

    it("should throw an error if no offerUuid is provided", async () => {
      const section = new OfferSection({
        title: "title",
        text: "text",
        displayOrder: 1
      });

      await expect(section.validate()).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: OfferSection.offerUuid cannot be null"
      );
    });
  });
});
