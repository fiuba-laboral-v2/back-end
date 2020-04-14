import Database from "../../../../src/config/Database";
import { Applicant } from "../../../../src/models/Applicant";
import { SectionRepository } from "../../../../src/models/Applicant/Section";
import { random, lorem } from "faker";
import { UserRepository } from "../../../../src/models/User/Repository";

describe("Section model", () => {
  let applicant: Applicant;

  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
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
      title: random.words(),
      text: lorem.paragraphs(),
      displayOrder: 1
    };

    await SectionRepository.updateOrCreate(applicant, params);
    const [section] = await applicant.getSections();

    expect(section).toBeDefined();
    expect(section).toHaveProperty("uuid");
    expect(section).toHaveProperty("applicantUuid");
    expect(section).toMatchObject({
      title: params.title,
      text: params.text,
      displayOrder: 1
    });
  });

  it("updates a valid section", async () => {
    const params = {
      title: random.words(),
      text: lorem.paragraphs(),
      displayOrder: 1
    };

    await SectionRepository.updateOrCreate(applicant, params);
    const [firstSection] = await applicant.getSections();

    const newParams = {
      uuid: firstSection.uuid,
      title: "New title",
      text: "New Text",
      displayOrder: 1
    };

    await SectionRepository.updateOrCreate(applicant, newParams);
    const [section] = await applicant.getSections();

    expect(section).toBeDefined();
    expect(section).toHaveProperty("uuid");
    expect(section).toHaveProperty("applicantUuid");
    expect(section).toMatchObject({
      title: "New title",
      text: "New Text",
      displayOrder: 1
    });
  });
});
