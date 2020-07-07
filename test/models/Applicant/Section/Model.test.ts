import { ValidationError } from "sequelize";
import { Database } from "../../../../src/config/Database";
import { Section } from "../../../../src/models";
import { lorem, random } from "faker";

describe("Section model", () => {
  const applicantUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";

  beforeAll(() => Database.setConnection());

  afterAll(() => Database.close());

  it("should create a valid section with a title and a text", async () => {
    const params = {
      applicantUuid: applicantUuid,
      title: random.words(),
      text: lorem.paragraphs(),
      displayOrder: 1
    };
    const section = new Section(params);

    expect(section).toHaveProperty("uuid");
    expect(section).toMatchObject({
      title: params.title,
      text: params.text,
      displayOrder: 1
    });
  });

  it("should throw an error if no title is provided", async () => {
    const section = new Section({ applicantUuid: applicantUuid, text: lorem.paragraphs() });

    await expect(section.validate()).rejects.toThrow(ValidationError);
  });

  it("should throw an error if no text is provided", async () => {
    const section = new Section({ applicantUuid: applicantUuid, title: random.words() });

    await expect(section.validate()).rejects.toThrow(ValidationError);
  });

  it("should throw an error if no applicantUuid is provided", async () => {
    const section = new Section({ title: random.words(), description: lorem.paragraphs() });

    await expect(section.save()).rejects.toThrow(ValidationError);
  });
});
