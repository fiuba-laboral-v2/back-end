import { UniqueConstraintError } from "sequelize";
import { ApplicantKnowledgeSectionRepository } from "$models/Applicant/ApplicantKnowledgeSection";
import { UserRepository } from "$models/User";
import { Applicant, ApplicantKnowledgeSection } from "$models";
import { ApplicantGenerator } from "$generators/Applicant";
import { UUID_REGEX } from "$test/models";

describe("ApplicantKnowledgeSectionRepository", () => {
  let applicant: Applicant;

  beforeAll(async () => {
    await UserRepository.truncate();
    applicant = await ApplicantGenerator.instance.withMinimumData();
  });

  beforeEach(() => ApplicantKnowledgeSectionRepository.truncate());

  it("creates a valid section", async () => {
    const sectionData = {
      title: "And all shooting some b-ball outside of the school",
      text: "When a couple of guys who were up to no good\nStarted making trouble in my",
      displayOrder: 1
    };

    await ApplicantKnowledgeSectionRepository.update([sectionData], applicant);
    const [section] = await applicant.getKnowledgeSections();
    expect(section).toBeObjectContaining({
      uuid: expect.stringMatching(UUID_REGEX),
      applicantUuid: applicant.uuid,
      ...sectionData
    });
  });

  it("throws an error if section has the same display order for the same applicant", async () => {
    await ApplicantKnowledgeSection.create({
      applicantUuid: applicant.uuid,
      title: "title",
      text: "text",
      displayOrder: 1
    });
    const sectionWithSameDisplayOrder = new ApplicantKnowledgeSection({
      applicantUuid: applicant.uuid,
      title: "another title",
      text: "another text",
      displayOrder: 1
    });
    await expect(sectionWithSameDisplayOrder.save()).rejects.toThrowErrorWithMessage(
      UniqueConstraintError,
      "Validation error"
    );
  });

  it("updates the section if the display order is the same", async () => {
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
    await ApplicantKnowledgeSectionRepository.update([params], applicant);
    const sections = await ApplicantKnowledgeSectionRepository.update([newParams], applicant);
    expect(sections).toEqual([expect.objectContaining(newParams)]);
  });

  it("updates a valid section", async () => {
    await ApplicantKnowledgeSectionRepository.update(
      [
        {
          title: "title",
          text: "text",
          displayOrder: 1
        }
      ],
      applicant
    );
    const [firstSection] = await applicant.getKnowledgeSections();

    const newParams = {
      uuid: firstSection.uuid,
      title: "New title",
      text: "New Text",
      displayOrder: 1
    };

    await ApplicantKnowledgeSectionRepository.update([newParams], applicant);
    const [section] = await applicant.getKnowledgeSections();

    expect(section).toBeObjectContaining({
      applicantUuid: applicant.uuid,
      ...newParams
    });
  });

  it("updates the sections given and deleting the rest of applicant sections", async () => {
    const params = [
      {
        title: "with her day after day",
        text: "But she packed my suit case and sent me on my way\nShe gave me a kiss",
        displayOrder: 1
      },
      {
        title: "and then she gave me my ticket",
        text: "I put my Walkman on and said, 'I might as well kick it'.\nFirst class, yo",
        displayOrder: 2
      }
    ];

    const initialSections = await ApplicantKnowledgeSectionRepository.update(params, applicant);
    expect(initialSections).toEqual(
      expect.arrayContaining(params.map(data => expect.objectContaining(data)))
    );

    const [firstSection] = await applicant.getKnowledgeSections();

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

    await ApplicantKnowledgeSectionRepository.update(newParams, applicant);
    const sections = await applicant.getKnowledgeSections();

    expect(sections).toEqual(
      expect.arrayContaining(newParams.map(data => expect.objectContaining(data)))
    );
  });
});
