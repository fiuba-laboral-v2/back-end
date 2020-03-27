import Database from "../../../../src/config/Database";
import { Section } from "../../../../src/models/Applicant";
import { random } from "faker";

describe("Section model", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await Section.truncate({ cascade: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("creates a valid section with a title and a description", async () => {
    const params = { title: random.words(), description: random.words() };
    const section = new Section(params);
    await section.save();

    expect(section).toBeDefined();
    expect(section).toHaveProperty("uuid");
    expect(section).toMatchObject({
      title: params.title,
      description: params.description
    });
  });

  it("raise an error if no title is provided", async () => {
    const section = new Section({ description: random.words() });

    await expect(section.save()).rejects.toThrow();
  });

  it("raise an error if no descriptino is provided", async () => {
    const section = new Section({ title: random.words() });

    await expect(section.save()).rejects.toThrow();
  });
});
