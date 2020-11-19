import { ValidationError } from "sequelize";
import { ApplicantExperienceSection } from "$models";
import { isUuid } from "$models/SequelizeModelValidators";
import { UUID } from "$models/UUID";
import { UUID_REGEX } from "$test/models";

describe("ApplicantExperienceSection", () => {
  const attributes = {
    applicantUuid: UUID.generate(),
    title: "title",
    text: "text",
    displayOrder: 1
  };

  const expectToThrowErrorOnMissingAttribute = async (attribute: string) => {
    delete attributes[attribute];
    const applicantExperienceSection = new ApplicantExperienceSection(attributes);
    await expect(applicantExperienceSection.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      `ApplicantExperienceSection.${attribute} cannot be null`
    );
  };

  const expectToThrowErrorOnInvalidUuidFormat = async (attribute: string) => {
    attributes[attribute] = "invalidUuidFormat";
    const applicantExperienceSection = new ApplicantExperienceSection(attributes);
    await expect(applicantExperienceSection.validate()).rejects.toThrowErrorWithMessage(
      ValidationError,
      isUuid.validate.isUUID.msg
    );
  };

  it("creates a valid section", async () => {
    const applicantExperienceSection = new ApplicantExperienceSection(attributes);
    await expect(applicantExperienceSection.validate()).resolves.not.toThrow();
    expect(applicantExperienceSection).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      ...attributes
    });
  });

  it("throws an error if applicantUuid hs invalid format", async () => {
    await expectToThrowErrorOnInvalidUuidFormat("applicantUuid");
  });

  it("throws an error if uuid hs invalid format", async () => {
    await expectToThrowErrorOnInvalidUuidFormat("uuid");
  });

  it("throws an error if no applicantUuid is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("applicantUuid");
  });

  it("throws an error if no title is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("title");
  });

  it("throws an error if no text is provided", async () => {
    await expectToThrowErrorOnMissingAttribute("text");
  });
});
