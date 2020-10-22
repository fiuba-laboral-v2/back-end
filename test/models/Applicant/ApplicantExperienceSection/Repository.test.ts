import { UniqueConstraintError, ValidationError } from "sequelize";
import { Applicant, ApplicantExperienceSection } from "$models";
import { ISection } from "$models/Applicant";
import { UserRepository } from "$models/User";
import { CareerRepository } from "$models/Career";
import { ApplicantExperienceSectionRepository } from "$models/Applicant/ApplicantExperienceSection";
import { ApplicantGenerator } from "$generators/Applicant";
import { UUID_REGEX } from "$test/models";

describe("ApplicantExperienceSectionRepository", () => {
  let student: Applicant;
  const applicantExperienceSectionRepository = new ApplicantExperienceSectionRepository();

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
    sectionsData: ISection[];
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

  const expectToUpdateNewSections = async (sectionsData: ISection[]) => {
    const sections = await applicantExperienceSectionRepository.update({
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

    await applicantExperienceSectionRepository.update({
      sections: [sectionData],
      applicant: student
    });

    await applicantExperienceSectionRepository.update({
      sections: [sectionData],
      applicant: graduate
    });

    const studentSections = await applicantExperienceSectionRepository.findByApplicant(student);
    const graduateSections = await applicantExperienceSectionRepository.findByApplicant(graduate);

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

    const [{ uuid }] = await applicantExperienceSectionRepository.update({
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

    const finalSections = await applicantExperienceSectionRepository.update({
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
      applicantExperienceSectionRepository.update({
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
      applicantExperienceSectionRepository.update({
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
      applicantExperienceSectionRepository.update({
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
      applicantExperienceSectionRepository.update({
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
