import { ValidationError } from "sequelize";
import { ApplicantKnowledgeSection } from "$models";

describe("Section model", () => {
  const applicantUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";

  it("should create a valid section with a title and a text", async () => {
    const params = {
      applicantUuid: applicantUuid,
      title: "Random words",
      text: "Now, this is a story all about how\nMy life got flipped-turned upside down",
      displayOrder: 1
    };
    const section = new ApplicantKnowledgeSection(params);

    expect(section).toHaveProperty("uuid");
    expect(section).toMatchObject({
      title: params.title,
      text: params.text,
      displayOrder: 1
    });
  });

  it("should throw an error if no title is provided", async () => {
    const section = new ApplicantKnowledgeSection({
      applicantUuid: applicantUuid,
      text: "And I'd like to take a minute\nJust sit right there"
    });
    await expect(section.validate()).rejects.toThrow(ValidationError);
  });

  it("should throw an error if no text is provided", async () => {
    const section = new ApplicantKnowledgeSection({
      applicantUuid: applicantUuid,
      title: "I'll tell you how I became the prince of a town called Bel Air"
    });
    await expect(section.validate()).rejects.toThrow(ValidationError);
  });

  it("should throw an error if no applicantUuid is provided", async () => {
    const section = new ApplicantKnowledgeSection({
      title: "In west Philadelphia born and raised",
      description: "On the playground was where I spent most of my days\nChillin out maxin relaxin"
    });
    await expect(section.save()).rejects.toThrow(ValidationError);
  });
});
