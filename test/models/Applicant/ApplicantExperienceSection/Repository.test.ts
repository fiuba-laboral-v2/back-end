import { UniqueConstraintError, ValidationError } from "sequelize";
import { Applicant, ApplicantExperienceSection } from "$models";
import { TSection } from "$models/Applicant";
import { UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";
import { ApplicantExperienceSectionRepository } from "$models/Applicant/ApplicantExperienceSection";
import { ApplicantGenerator } from "$generators/Applicant";
import { UUID_REGEX } from "$test/models";

describe("ApplicantExperienceSectionRepository", () => {
  let student: Applicant;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CareerRepository.truncate();

    student = await ApplicantGenerator.instance.student();
  });

  const expectToEqualSectionsForApplicant = async ({
    sections,
    sectionsData,
    applicant
  }: {
    sections: ApplicantExperienceSection[];
    sectionsData: TSection[];
    applicant: Applicant;
  }) => {
    expect(sections).toEqual(
      sectionsData.map(data =>
        expect.objectContaining({
          uuid: expect.stringMatching(UUID_REGEX),
          applicantUuid: applicant.uuid,
          ...data
        })
      )
    );
  };

  const expectToUpdateNewSections = async (sectionsData: TSection[]) => {
    const sections = await ApplicantExperienceSectionRepository.update({
      sections: sectionsData,
      applicant: student
    });
    await expectToEqualSectionsForApplicant({
      sections,
      sectionsData,
      applicant: student
    });
  };

  it("creates a valid section", async () => {
    await expectToUpdateNewSections([
      {
        title: "title",
        text: "text",
        displayOrder: 1
      }
    ]);
  });

  it("updates a section with the same displayOrder for different applicants", async () => {
    const sectionData = {
      title: "newTitle",
      text: "newText",
      displayOrder: 1
    };

    const graduate = await ApplicantGenerator.instance.graduate();

    await ApplicantExperienceSectionRepository.update({
      sections: [sectionData],
      applicant: student
    });

    await ApplicantExperienceSectionRepository.update({
      sections: [sectionData],
      applicant: graduate
    });

    const studentSections = await ApplicantExperienceSectionRepository.findByApplicant(student);
    const graduateSections = await ApplicantExperienceSectionRepository.findByApplicant(graduate);

    await expectToEqualSectionsForApplicant({
      sections: studentSections,
      sectionsData: [sectionData],
      applicant: student
    });

    await expectToEqualSectionsForApplicant({
      sections: graduateSections,
      sectionsData: [sectionData],
      applicant: graduate
    });
  });

  it("updates a section with by uuid for the same applicant", async () => {
    const sectionData = {
      title: "title",
      text: "text",
      displayOrder: 1
    };

    const [{ uuid }] = await ApplicantExperienceSectionRepository.update({
      sections: [sectionData],
      applicant: student
    });

    const initialSections = await student.getExperienceSections();
    expect(initialSections).toEqual([expect.objectContaining(sectionData)]);

    const newSectionData = {
      title: "newTitle",
      text: "newText",
      displayOrder: 1
    };

    const finalSections = await ApplicantExperienceSectionRepository.update({
      sections: [
        {
          uuid,
          ...newSectionData
        }
      ],
      applicant: student
    });
    expect(finalSections).toEqual([expect.objectContaining({ uuid, ...newSectionData })]);
  });

  it("removes all previous sections and creates two new ones", async () => {
    await expectToUpdateNewSections([
      {
        title: "firstTitle",
        text: "firstText",
        displayOrder: 1
      },
      {
        title: "firstTitle",
        text: "firstText",
        displayOrder: 2
      }
    ]);

    await expectToUpdateNewSections([
      {
        title: "thirdTitle",
        text: "thirdText",
        displayOrder: 1
      },
      {
        title: "fourthTitle",
        text: "fourthText",
        displayOrder: 2
      }
    ]);
  });

  it("throws an error if two sections have the same displayOrder for the same student", async () => {
    await expect(
      ApplicantExperienceSectionRepository.update({
        sections: [
          {
            title: "thirdTitle",
            text: "thirdText",
            displayOrder: 1
          },
          {
            title: "fourthTitle",
            text: "fourthText",
            displayOrder: 1
          }
        ],
        applicant: student
      })
    ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");
  });

  it("throws an error if a section has no title", async () => {
    await expect(
      ApplicantExperienceSectionRepository.update({
        sections: [
          {
            title: undefined as any,
            text: "thirdText",
            displayOrder: 1
          },
          {
            title: "fourthTitle",
            text: "fourthText",
            displayOrder: 1
          }
        ],
        applicant: student
      })
    ).rejects.toThrowBulkRecordErrorIncluding([
      {
        errorClass: ValidationError,
        message: "ApplicantExperienceSection.title cannot be null"
      }
    ]);
  });

  it("throws an error if a section has no text", async () => {
    await expect(
      ApplicantExperienceSectionRepository.update({
        sections: [
          {
            title: "title",
            text: undefined as any,
            displayOrder: 1
          },
          {
            title: "fourthTitle",
            text: "fourthText",
            displayOrder: 1
          }
        ],
        applicant: student
      })
    ).rejects.toThrowBulkRecordErrorIncluding([
      {
        errorClass: ValidationError,
        message: "ApplicantExperienceSection.text cannot be null"
      }
    ]);
  });

  it("throws an error if more than one section has no title", async () => {
    await expect(
      ApplicantExperienceSectionRepository.update({
        sections: [
          {
            title: undefined as any,
            text: "text",
            displayOrder: 1
          },
          {
            title: undefined as any,
            text: "fourthText",
            displayOrder: 1
          }
        ],
        applicant: student
      })
    ).rejects.toThrowBulkRecordErrorIncluding([
      {
        errorClass: ValidationError,
        message: "ApplicantExperienceSection.title cannot be null"
      },
      {
        errorClass: ValidationError,
        message: "ApplicantExperienceSection.title cannot be null"
      }
    ]);
  });
});
