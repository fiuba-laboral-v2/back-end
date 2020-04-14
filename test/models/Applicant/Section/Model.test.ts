import Database from "../../../../src/config/Database";
import { Applicant } from "../../../../src/models/Applicant";
import { Section } from "../../../../src/models/Applicant/Section";
import { lorem, random } from "faker";
import { UserRepository } from "../../../../src/models/User/Repository";

describe("Section model", () => {
  let applicant: Applicant;

  beforeAll(async () => {
    await Database.setConnection();
    await UserRepository.truncate();
    const myApplicant = new Applicant({
      name: "Bruno",
      surname: "Diaz",
      padron: 1,
      description: "Batman",
      credits: 150,
      userUuid: (await UserRepository.create({
        email: "sblanco@yahoo.com",
        password: "fdmgkfHGH4353"
      })).uuid
    });
    applicant = await myApplicant.save();
  });

  afterAll(async () => {
    await UserRepository.truncate();
    await Database.close();
  });

  it("creates a valid section with a title and a text", async () => {
    const params = {
      applicantUuid: applicant.uuid,
      title: random.words(),
      text: lorem.paragraphs(),
      displayOrder: 1
    };
    const section = new Section(params);

    expect(section).toBeDefined();
    expect(section).toHaveProperty("uuid");
    expect(section).toMatchObject({
      title: params.title,
      text: params.text,
      displayOrder: 1
    });
  });

  it("should throw an error if no title is provided", async () => {
    const section = new Section({ applicantUuid: applicant.uuid, text: lorem.paragraphs() });

    await expect(section.save()).rejects.toThrow();
  });

  it("should throw an error if no text is provided", async () => {
    const section = new Section({ applicantUuid: applicant.uuid, title: random.words() });

    await expect(section.save()).rejects.toThrow();
  });

  it("should throw an error if no applicantUuid is provided", async () => {
    const section = new Section({ title: random.words(), description: lorem.paragraphs() });

    await expect(section.save()).rejects.toThrow();
  });

  it("does not allow 2 sections with the same display order for the same applicant",async () => {
      const params = {
        applicantUuid: applicant.uuid,
        title: random.words(),
        text: lorem.paragraphs(),
        displayOrder: 1
      };
      const section = new Section(params);
      await section.save();

      const sectionWithSameDisplayOrder = new Section({
        ...params, title: "New Title", text: "New Text"
      });
      await expect(sectionWithSameDisplayOrder.save()).rejects.toThrow();
    });
});
