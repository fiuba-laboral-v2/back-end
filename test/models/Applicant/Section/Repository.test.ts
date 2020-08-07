import { ApplicantRepository } from "$models/Applicant";
import { SectionRepository } from "$models/Applicant/Section";
import { lorem, random } from "faker";
import { UserRepository } from "$models/User";
import { Applicant, Section } from "$models";

describe("Section model", () => {
  let applicant: Applicant;

  beforeAll(async () => {
    await UserRepository.truncate();
    applicant = await ApplicantRepository.create({
      user: {
        email: "sblanco@yahoo.com",
        password: "fdmgkfHGH4353",
        name: "Bruno",
        surname: "Diaz"
      },
      careers: [],
      padron: 1,
      description: "Batman"
    });
  });

  beforeEach(() => Section.destroy({ truncate: true }));

  it("should create a valid section with a title and a text", async () => {
    const sectionData = {
      title: random.words(),
      text: lorem.paragraphs(),
      displayOrder: 1
    };

    await SectionRepository.update([sectionData], applicant);
    const [section] = await applicant.getSections();

    expect(section).toHaveProperty("uuid");
    expect(section).toMatchObject({
      applicantUuid: applicant.uuid,
      title: sectionData.title,
      text: sectionData.text,
      displayOrder: 1
    });
  });

  it(
    "should throw an error if section has the same display order for the same applicant",
    async () => {
      await Section.create({
        applicantUuid: applicant.uuid,
        title: "title",
        text: "text",
        displayOrder: 1
      });
      const sectionWithSameDisplayOrder = new Section({
        applicantUuid: applicant.uuid,
        title: "another title",
        text: "another text",
        displayOrder: 1
      });
      await expect(sectionWithSameDisplayOrder.save()).rejects.toThrow();
    }
  );

  it("should update the sections if the display order is the same", async () => {
    const params = {
      title: "title",
      text: "text",
      displayOrder: 1
    };
    const newParams = {
      title: "new title",
      text: "new text",
      displayOrder: 1
    };
    await SectionRepository.update([params], applicant);
    const sections = await SectionRepository.update([newParams], applicant);
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject(newParams);
  });

  it("should update a valid section", async () => {
    const params = [{
      title: random.words(),
      text: lorem.paragraphs(),
      displayOrder: 1
    }];

    await SectionRepository.update(params, applicant);
    const [firstSection] = await applicant.getSections();

    const newParams = [{
      uuid: firstSection.uuid,
      title: "New title",
      text: "New Text",
      displayOrder: 1
    }];

    await SectionRepository.update(newParams, applicant);
    const [section] = await applicant.getSections();

    expect(section).toHaveProperty("uuid");
    expect(section).toMatchObject({
      applicantUuid: applicant.uuid,
      title: "New title",
      text: "New Text",
      displayOrder: 1
    });
  });

  it("should update the sections given and deleting the rest of applicant sections", async () => {
    const params = [
      {
        title: random.words(),
        text: lorem.paragraphs(),
        displayOrder: 1
      },
      {
        title: random.words(),
        text: lorem.paragraphs(),
        displayOrder: 2
      }
    ];

    await SectionRepository.update(params, applicant);
    const [firstSection] = await applicant.getSections();

    const newParams = [
      {
        uuid: firstSection.uuid,
        title: "New title",
        text: "New Text",
        displayOrder: 1
      },
      {
        title: "third section",
        text: "new third section text",
        displayOrder: 2
      }
    ];

    await SectionRepository.update(newParams, applicant);
    const sections = await applicant.getSections();

    expect(sections.map(({ title }) => title)).toEqual(["New title", "third section"]);
  });
});
