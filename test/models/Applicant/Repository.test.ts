import {
  DatabaseError,
  ForeignKeyConstraintError,
  ValidationError,
  UniqueConstraintError
} from "sequelize";
import {
  ApplicantNotFound,
  ApplicantNotUpdatedError,
  ApplicantWithNoCareersError
} from "$models/Applicant/Errors";
import { FiubaUserNotFoundError } from "$models/User/Errors";
import {
  ForbiddenCurrentCareerYearError,
  MissingApprovedSubjectCountError
} from "$models/Applicant/ApplicantCareer/Errors";

import { CareerRepository } from "$models/Career";
import { ApplicantRepository, IApplicantEditable, TSection } from "$models/Applicant";
import { Admin, Applicant, ApplicantKnowledgeSection } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantType } from "$models/Applicant";
import { ApplicantCareersRepository } from "$models/Applicant/ApplicantCareer";
import { ApplicantKnowledgeSectionRepository } from "$models/Applicant/ApplicantKnowledgeSection";
import { ApplicantExperienceSectionRepository } from "$models/Applicant/ApplicantExperienceSection";
import { UserRepository } from "$models/User";
import { CapabilityRepository } from "$models/Capability";
import { FiubaUsersService } from "$services/FiubaUsers";

import { ApplicantGenerator } from "$generators/Applicant";
import { CareerGenerator } from "$generators/Career";
import { AdminGenerator } from "$generators/Admin";

import { isApprovalStatus } from "$models/SequelizeModelValidators";
import { UUID_REGEX } from "$test/models";
import { get, set } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

describe("ApplicantRepository", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CareerRepository.truncate();
    await CapabilityRepository.truncate();
  });

  describe("Create", () => {
    describe("getType", () => {
      it("creates a graduate", async () => {
        const firstCareer = await CareerGenerator.instance();
        const applicant = await ApplicantRepository.create({
          ...ApplicantGenerator.data.minimum(),
          careers: [{ careerCode: firstCareer.code, isGraduate: true }]
        });
        expect(await applicant.getType()).toEqual(ApplicantType.graduate);
      });

      it("creates a student", async () => {
        const firstCareer = await CareerGenerator.instance();
        const applicant = await ApplicantRepository.create({
          ...ApplicantGenerator.data.minimum(),
          careers: [
            {
              careerCode: firstCareer.code,
              isGraduate: false,
              approvedSubjectCount: 40,
              currentCareerYear: 5
            }
          ]
        });
        expect(await applicant.getType()).toEqual(ApplicantType.student);
      });

      it("creates an applicant that is a student for one career and a graduate for another one", async () => {
        const firstCareer = await CareerGenerator.instance();
        const secondCareer = await CareerGenerator.instance();
        const applicant = await ApplicantRepository.create({
          ...ApplicantGenerator.data.minimum(),
          careers: [
            {
              careerCode: firstCareer.code,
              isGraduate: false,
              approvedSubjectCount: 40,
              currentCareerYear: 5
            },
            {
              careerCode: secondCareer.code,
              isGraduate: true
            }
          ]
        });
        expect(await applicant.getType()).toEqual(ApplicantType.both);
      });

      it("throws an error if the applicant has no careers", async () => {
        const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
        await expect(applicant.getType()).rejects.toThrowErrorWithMessage(
          ApplicantWithNoCareersError,
          ApplicantWithNoCareersError.buildMessage(applicant.uuid)
        );
      });
    });

    it("creates a new applicant", async () => {
      const career = await CareerGenerator.instance();
      const applicantData = ApplicantGenerator.data.minimum();
      const applicantCareerData = { careerCode: career.code, isGraduate: true };
      const applicant = await ApplicantRepository.create({
        ...applicantData,
        careers: [applicantCareerData],
        capabilities: ["Python"]
      });
      const [applicantCareer] = await applicant.getApplicantCareers();

      expect(applicant).toEqual(
        expect.objectContaining({
          uuid: expect.stringMatching(UUID_REGEX),
          padron: applicantData.padron,
          description: applicantData.description
        })
      );
      expect(applicantCareer).toBeObjectContaining(applicantCareerData);
      const capabilities = await applicant.getCapabilities();
      const capabilityDescriptions = capabilities.map(c => c.description.toLowerCase());
      expect(capabilityDescriptions).toEqual(["Python".toLowerCase()]);
    });

    it("creates two valid applicant in the same career", async () => {
      const career = await CareerGenerator.instance();
      const applicantCareer = {
        careerCode: career.code,
        isGraduate: true
      };
      await ApplicantRepository.create({
        ...ApplicantGenerator.data.minimum(),
        careers: [applicantCareer]
      });
      await expect(
        ApplicantRepository.create({
          ...ApplicantGenerator.data.minimum(),
          careers: [applicantCareer]
        })
      ).resolves.not.toThrow(ApplicantNotFound);
    });

    it("creates an applicant without a career and without capabilities", async () => {
      const applicantData = ApplicantGenerator.data.minimum();
      const savedApplicant = await ApplicantRepository.create(applicantData);
      const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);
      expect(await applicant.getCareers()).toHaveLength(0);
      expect(await applicant.getCapabilities()).toHaveLength(0);
    });

    it("creates an applicant with capabilities", async () => {
      const applicantData = ApplicantGenerator.data.minimum();
      const applicant = await ApplicantRepository.create({
        ...applicantData,
        capabilities: ["Python"]
      });
      const [capability] = await applicant.getCapabilities();
      expect(capability.description).toEqual("Python");
    });

    it("creates applicant with a valid knowledge section", async () => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const sectionData = { title: "title", text: "text", displayOrder: 1 };
      await ApplicantKnowledgeSectionRepository.update([sectionData], applicant);
      const [section] = await applicant.getKnowledgeSections();
      expect(section).toBeObjectContaining(sectionData);
    });

    it("creates applicant with a valid experience section", async () => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const sectionData = { title: "title", text: "text", displayOrder: 1 };
      await ApplicantExperienceSectionRepository.update({ sections: [sectionData], applicant });
      const [section] = await applicant.getExperienceSections();
      expect(section).toBeObjectContaining(sectionData);
    });

    it("throws an error if no padron is given", async () => {
      const applicantData = ApplicantGenerator.data.minimum();
      delete applicantData.padron;
      await expect(ApplicantRepository.create(applicantData)).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: Applicant.padron cannot be null"
      );
    });

    it("throws an error it is not specified if the applicant is a graduate", async () => {
      const career = await CareerGenerator.instance();
      const applicantData = {
        ...ApplicantGenerator.data.minimum(),
        careers: [
          {
            careerCode: career.code,
            isGraduate: true
          }
        ]
      };
      delete applicantData.careers[0].isGraduate;
      await expect(
        ApplicantRepository.create(applicantData)
      ).rejects.toThrowBulkRecordErrorIncluding([
        {
          errorClass: ValidationError,
          message: "notNull Violation: ApplicantCareer.isGraduate cannot be null"
        }
      ]);
    });

    it("throws an error if the FiubaService authentication returns false", async () => {
      const fiubaUsersServiceMock = jest.spyOn(FiubaUsersService, "authenticate");
      fiubaUsersServiceMock.mockResolvedValueOnce(Promise.resolve(false));

      const applicantData = ApplicantGenerator.data.minimum();
      await expect(ApplicantRepository.create(applicantData)).rejects.toThrowErrorWithMessage(
        FiubaUserNotFoundError,
        FiubaUserNotFoundError.buildMessage(applicantData.user.dni)
      );
    });
  });

  describe("Get", () => {
    it("retrieves applicant by padron", async () => {
      const applicantData = ApplicantGenerator.data.minimum();
      const career = await CareerGenerator.instance();
      const applicantCareerData = { careerCode: career.code, isGraduate: true };
      await ApplicantRepository.create({
        ...applicantData,
        careers: [applicantCareerData],
        capabilities: ["Node"]
      });

      const applicant = await ApplicantRepository.findByPadron(applicantData.padron);

      expect(applicant).toEqual(
        expect.objectContaining({
          uuid: expect.stringMatching(UUID_REGEX),
          padron: applicantData.padron,
          description: applicantData.description
        })
      );

      const [applicantCareer] = await applicant.getApplicantCareers();
      expect(applicantCareer).toBeObjectContaining(applicantCareerData);

      const capabilities = await applicant.getCapabilities();
      const capabilityDescriptions = capabilities.map(c => c.description.toLowerCase());
      expect(capabilityDescriptions).toEqual(["Node".toLowerCase()]);
    });

    it("retrieves applicant by uuid", async () => {
      const applicantData = ApplicantGenerator.data.minimum();
      const career = await CareerGenerator.instance();
      const applicantCareerData = { careerCode: career.code, isGraduate: true };
      const { uuid } = await ApplicantRepository.create({
        ...applicantData,
        careers: [applicantCareerData],
        capabilities: ["GO"]
      });
      const applicant = await ApplicantRepository.findByUuid(uuid);

      expect(applicant).toEqual(
        expect.objectContaining({
          uuid: expect.stringMatching(UUID_REGEX),
          padron: applicantData.padron,
          description: applicantData.description
        })
      );

      const [applicantCareer] = await applicant.getApplicantCareers();
      expect(applicantCareer).toBeObjectContaining(applicantCareerData);
      const capabilities = await applicant.getCapabilities();
      const capabilityDescriptions = capabilities.map(c => c.description.toLowerCase());
      expect(capabilityDescriptions).toEqual(["GO".toLowerCase()]);
    });

    it("throws ApplicantNotFound if the applicant doesn't exists", async () => {
      const { padron } = ApplicantGenerator.data.minimum();
      await expect(ApplicantRepository.findByPadron(padron)).rejects.toThrow(ApplicantNotFound);
    });

    describe("findLatest", () => {
      let applicant1;
      let applicant2;
      let applicant3;

      const generateApplicants = async () => {
        return [
          await ApplicantGenerator.instance.withMinimumData(),
          await ApplicantGenerator.instance.withMinimumData(),
          await ApplicantGenerator.instance.withMinimumData()
        ];
      };

      beforeAll(async () => {
        [applicant1, applicant2, applicant3] = await generateApplicants();
      });

      it("returns the latest applicant first", async () => {
        const applicants = await ApplicantRepository.findLatest();
        const firstApplicantInList = [
          applicants.results[0],
          applicants.results[1],
          applicants.results[2]
        ];

        expect(applicants.shouldFetchMore).toEqual(false);
        expect(firstApplicantInList).toEqual([
          expect.objectContaining({
            uuid: applicant3.uuid,
            padron: applicant3.padron,
            approvalStatus: ApprovalStatus.pending
          }),
          expect.objectContaining({
            uuid: applicant2.uuid,
            padron: applicant2.padron,
            approvalStatus: ApprovalStatus.pending
          }),
          expect.objectContaining({
            uuid: applicant1.uuid,
            padron: applicant1.padron,
            approvalStatus: ApprovalStatus.pending
          })
        ]);
      });

      describe("fetchMore", () => {
        let applicant4;
        let applicant5;
        let applicant6;
        let applicant7;

        beforeAll(async () => {
          [applicant4, applicant5, applicant6] = await generateApplicants();
          [applicant7, ,] = await generateApplicants();
        });

        it("gets the next 3 Applicants", async () => {
          const itemsPerPage = 3;
          mockItemsPerPage(itemsPerPage);

          const updatedBeforeThan = {
            dateTime: applicant7.updatedAt,
            uuid: applicant7.uuid
          };

          const applicants = await ApplicantRepository.findLatest(updatedBeforeThan);
          expect(applicants.results).toEqual([
            expect.objectContaining({
              uuid: applicant6.uuid,
              padron: applicant6.padron,
              approvalStatus: ApprovalStatus.pending
            }),
            expect.objectContaining({
              uuid: applicant5.uuid,
              padron: applicant5.padron,
              approvalStatus: ApprovalStatus.pending
            }),
            expect.objectContaining({
              uuid: applicant4.uuid,
              padron: applicant4.padron,
              approvalStatus: ApprovalStatus.pending
            })
          ]);
          expect(applicants.shouldFetchMore).toBe(true);
        });
      });
    });
  });

  describe("Update", () => {
    const sectionsData = [
      {
        title: "myTitle",
        text: "some description",
        displayOrder: 1
      },
      {
        title: "second section",
        text: "other description",
        displayOrder: 2
      }
    ];

    const newSectionsData = (uuid: string) => [
      {
        uuid: uuid,
        title: "second section",
        text: "new some description",
        displayOrder: 2
      },
      {
        title: "Third section",
        text: "some other description",
        displayOrder: 3
      }
    ];

    const expectSectionsToContainData = (sections: ApplicantKnowledgeSection[], data: TSection[]) =>
      expect(sections).toEqual(
        expect.arrayContaining(data.map(sectionData => expect.objectContaining(sectionData)))
      );

    const expectToUpdateProperty = async (attributeKey: string, newValue: string) => {
      const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      let newProps: IApplicantEditable = { uuid };
      newProps = set(newProps, attributeKey, newValue);
      const applicant = await ApplicantRepository.update(newProps);
      applicant.user = await applicant.getUser();
      expect(get(applicant, attributeKey)).toEqual(get(newProps, attributeKey));
    };

    it("updates all props", async () => {
      const { code: careerCode } = await CareerGenerator.instance();
      const { uuid } = await ApplicantRepository.create({
        ...ApplicantGenerator.data.minimum(),
        careers: [{ careerCode, isGraduate: true }]
      });
      const newCareer = await CareerGenerator.instance();
      const newProps: IApplicantEditable = {
        uuid,
        user: {
          name: "newName",
          surname: "newSurname"
        },
        description: "newDescription",
        capabilities: ["CSS", "clojure"],
        careers: [
          {
            careerCode: newCareer.code,
            approvedSubjectCount: 20,
            currentCareerYear: 3,
            isGraduate: false
          }
        ],
        experienceSections: [
          {
            title: "Devartis",
            text: "I was the project manager",
            displayOrder: 1
          },
          {
            title: "Google",
            text: "I am the CEO of google in ireland",
            displayOrder: 2
          }
        ],
        knowledgeSections: [
          {
            title: "title",
            text: "some description",
            displayOrder: 1
          }
        ],
        links: [
          {
            name: "someName",
            url: "https://some.url"
          }
        ]
      };
      const applicant = await ApplicantRepository.update(newProps);
      const applicantCareers = await applicant.getApplicantCareers();
      const capabilities = await applicant.getCapabilities();
      const sections = await applicant.getKnowledgeSections();
      const experienceSections = await applicant.getExperienceSections();
      const links = await applicant.getLinks();
      const user = await applicant.getUser();

      expect(applicant).toBeObjectContaining({ description: newProps.description });
      expect(user).toBeObjectContaining(newProps.user!);
      expect(capabilities.map(c => c.description)).toEqual(
        expect.arrayContaining(newProps.capabilities!)
      );
      expect(applicantCareers).toEqual(
        newProps.careers?.map(career => expect.objectContaining(career))
      );
      expect(links).toEqual(newProps.links?.map(link => expect.objectContaining(link)));
      expect(sections).toEqual(
        newProps.knowledgeSections?.map(section => expect.objectContaining(section))
      );
      expect(experienceSections).toEqual(
        newProps.experienceSections?.map(section => expect.objectContaining(section))
      );
    });

    it("updates name", async () => {
      await expectToUpdateProperty("user.name", "newName");
    });

    it("updates surname", async () => {
      await expectToUpdateProperty("user.surname", "newSurname");
    });

    it("updates email", async () => {
      await expectToUpdateProperty("user.email", "newEmail@gmail.com");
    });

    it("updates description", async () => {
      await expectToUpdateProperty("description", "newDescription");
    });

    it("updates by adding new capabilities", async () => {
      const capabilities = ["CSS", "clojure"];
      const applicant = await ApplicantGenerator.instance.withMinimumData({ capabilities });
      expect((await applicant.getCapabilities()).map(c => c.description)).toEqual(
        expect.arrayContaining(capabilities)
      );

      const newCapabilities = ["Python", "clojure"];
      const changeOneProps: IApplicantEditable = {
        uuid: applicant.uuid,
        capabilities: newCapabilities
      };

      await ApplicantRepository.update(changeOneProps);
      expect((await applicant.getCapabilities()).map(c => c.description)).toEqual(
        expect.arrayContaining(newCapabilities)
      );
    });

    it("updates by deleting all capabilities if none is provided", async () => {
      const capabilities = ["CSS", "clojure"];
      const applicant = await ApplicantGenerator.instance.withMinimumData({ capabilities });

      expect((await applicant.getCapabilities()).map(capability => capability.description)).toEqual(
        expect.arrayContaining(capabilities)
      );

      await ApplicantRepository.update({ uuid: applicant.uuid });
      expect(await applicant.getCapabilities()).toHaveLength(0);
    });

    it("updates by keeping only the new careers", async () => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const firstCareer = await CareerGenerator.instance();
      const secondCareer = await CareerGenerator.instance();
      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            careerCode: firstCareer.code,
            approvedSubjectCount: 20,
            currentCareerYear: 3,
            isGraduate: false
          },
          {
            careerCode: secondCareer.code,
            approvedSubjectCount: 20,
            currentCareerYear: 3,
            isGraduate: false
          }
        ]
      };

      const updatedApplicant = await ApplicantRepository.update(newProps);
      expect((await updatedApplicant.getCareers()).map(career => career.code)).toEqual(
        expect.arrayContaining([firstCareer.code, secondCareer.code])
      );

      const thirdCareer = await CareerGenerator.instance();
      const updatedProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            careerCode: thirdCareer.code,
            isGraduate: true
          },
          {
            careerCode: secondCareer.code,
            isGraduate: true
          }
        ]
      };

      await ApplicantRepository.update(updatedProps);
      expect((await updatedApplicant.getCareers()).map(career => career.code)).toEqual(
        expect.arrayContaining([thirdCareer.code, secondCareer.code])
      );
    });

    it("updates by keeping only the new knowledgeSections", async () => {
      const { uuid } = await ApplicantGenerator.instance.withMinimumData();
      const applicant = await ApplicantRepository.update({ uuid, knowledgeSections: sectionsData });
      const initialSections = await applicant.getKnowledgeSections();
      expectSectionsToContainData(initialSections, sectionsData);

      const secondSection = initialSections.find(({ title }) => title === sectionsData[1].title);

      const updatedApplicant = await ApplicantRepository.update({
        uuid,
        knowledgeSections: newSectionsData(secondSection!.uuid)
      });
      const updatedSections = await updatedApplicant.getKnowledgeSections();

      expectSectionsToContainData(updatedSections, newSectionsData(secondSection!.uuid));
    });

    it("updates by keeping only the new experienceSections", async () => {
      const { uuid } = await ApplicantGenerator.instance.withMinimumData();
      const applicant = await ApplicantRepository.update({
        uuid,
        experienceSections: sectionsData
      });

      const initialExperienceSections = await applicant.getExperienceSections();
      expectSectionsToContainData(initialExperienceSections, sectionsData);
      const secondSection = initialExperienceSections.find(
        ({ title }) => title === sectionsData[1].title
      );

      const updatedApplicant = await ApplicantRepository.update({
        uuid,
        experienceSections: newSectionsData(secondSection!.uuid)
      });
      const updatedExperienceSections = await updatedApplicant.getExperienceSections();
      expectSectionsToContainData(updatedExperienceSections, newSectionsData(secondSection!.uuid));
    });

    it("updates deleting all experienceSections if none is provided", async () => {
      const { uuid } = await ApplicantGenerator.instance.withMinimumData();
      let updatedApplicant = await ApplicantRepository.update({
        uuid,
        experienceSections: sectionsData
      });

      const initialExperienceSections = await updatedApplicant.getExperienceSections();
      expect(initialExperienceSections).toHaveLength(sectionsData.length);

      updatedApplicant = await ApplicantRepository.update({ uuid, experienceSections: [] });
      expect(await updatedApplicant.getExperienceSections()).toHaveLength(0);
    });

    it("updates deleting all sections if none is provided", async () => {
      const { uuid } = await ApplicantGenerator.instance.withMinimumData();
      let updatedApplicant = await ApplicantRepository.update({
        uuid,
        knowledgeSections: sectionsData
      });

      const initialSections = await updatedApplicant.getKnowledgeSections();
      expect(initialSections).toHaveLength(sectionsData.length);

      updatedApplicant = await ApplicantRepository.update({ uuid, knowledgeSections: [] });
      expect(await updatedApplicant.getKnowledgeSections()).toHaveLength(0);
    });

    it("updates by keeping only the new links", async () => {
      const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const linksData = [
        {
          name: "LinkedIn",
          url: "https://www.linkedin.com/in/dylan-alvarez-89430b88/"
        },
        {
          name: "GitHub",
          url: "https://github.com"
        }
      ];
      const applicant = await ApplicantRepository.update({
        uuid,
        links: linksData
      });
      expect((await applicant.getLinks()).map(({ url, name }) => ({ url, name }))).toEqual(
        expect.arrayContaining(linksData)
      );
      const newLinksData = [
        {
          name: "GitHub",
          url: "https://github.com"
        },
        {
          name: "Google",
          url: "http://www.google.com"
        }
      ];
      const updatedApplicant = await ApplicantRepository.update({
        uuid,
        links: newLinksData
      });
      expect(
        (await updatedApplicant.getLinks()).map(({ url, name }) => ({
          url,
          name
        }))
      ).toEqual(expect.arrayContaining(newLinksData));
    });

    it("updates by deleting all links if none is provided", async () => {
      const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const applicant = await ApplicantRepository.update({
        uuid,
        links: [
          {
            name: "GitHub",
            url: "https://github.com"
          },
          {
            name: "Google",
            url: "http://www.google.com"
          }
        ]
      });
      await ApplicantRepository.update({ uuid });
      expect((await applicant.getLinks()).length).toEqual(0);
    });

    it("does not throw an error when adding an existing capability", async () => {
      const { uuid } = await ApplicantRepository.create({
        ...ApplicantGenerator.data.minimum(),
        capabilities: ["GO"]
      });
      await expect(
        ApplicantRepository.update({ uuid, capabilities: ["GO"] })
      ).resolves.not.toThrow();
    });

    it("updates currentCareerYear and approvedSubjectCount of applicant careers", async () => {
      const career = await CareerGenerator.instance();
      const { uuid } = await ApplicantRepository.create({
        ...ApplicantGenerator.data.minimum(),
        careers: [
          {
            careerCode: career.code,
            isGraduate: false,
            currentCareerYear: 2,
            approvedSubjectCount: 10
          }
        ]
      });
      const newApplicantCareerData = {
        careerCode: career.code,
        currentCareerYear: 3,
        approvedSubjectCount: 17,
        isGraduate: false
      };
      await ApplicantRepository.update({
        uuid,
        careers: [newApplicantCareerData]
      });

      const updatedApplicantCareer = await ApplicantCareersRepository.findByApplicantAndCareer(
        uuid,
        career.code
      );
      expect(updatedApplicantCareer).toBeObjectContaining(newApplicantCareerData);
    });

    it("updates by deleting all applicant careers if none is provided", async () => {
      const career = await CareerGenerator.instance();
      const applicant = await ApplicantRepository.create({
        ...ApplicantGenerator.data.minimum(),
        careers: [{ careerCode: career.code, isGraduate: true }]
      });
      const newApplicantCareerData = [{ careerCode: career.code, isGraduate: true }];
      await ApplicantRepository.update({
        uuid: applicant.uuid,
        careers: newApplicantCareerData
      });
      expect((await applicant.getCareers()).length).toEqual(1);
      await ApplicantRepository.update({ uuid: applicant.uuid });
      expect((await applicant.getCareers()).length).toEqual(0);
    });

    describe("with wrong parameters", () => {
      it("throws an error if currentCareerYear is present for a graduated", async () => {
        const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
        const { code: careerCode } = await CareerGenerator.instance();
        const dataToUpdate = {
          uuid,
          careers: [
            {
              careerCode,
              currentCareerYear: 3,
              isGraduate: true
            }
          ]
        };
        await expect(
          ApplicantRepository.update(dataToUpdate)
        ).rejects.toThrowBulkRecordErrorIncluding([
          {
            errorClass: ValidationError,
            message: ForbiddenCurrentCareerYearError.buildMessage()
          }
        ]);
      });

      it("throws an error if approvedSubjectCount is missing for a non graduate", async () => {
        const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
        const { code: careerCode } = await CareerGenerator.instance();
        const dataToUpdate = {
          uuid,
          careers: [
            {
              careerCode,
              currentCareerYear: 3,
              isGraduate: false
            }
          ]
        };
        await expect(
          ApplicantRepository.update(dataToUpdate)
        ).rejects.toThrowBulkRecordErrorIncluding([
          {
            errorClass: ValidationError,
            message: MissingApprovedSubjectCountError.buildMessage()
          }
        ]);
      });

      it("does not update if two knowledgeSections have the same displayOrder", async () => {
        const { uuid } = await ApplicantGenerator.instance.withMinimumData();
        const applicant = await ApplicantRepository.update({
          uuid,
          knowledgeSections: sectionsData
        });
        const sectionsDataWithSameDisplayOrder = [
          {
            ...sectionsData[0],
            displayOrder: 2
          },
          {
            ...sectionsData[0],
            displayOrder: 2
          }
        ];
        await expect(
          ApplicantRepository.update({ uuid, knowledgeSections: sectionsDataWithSameDisplayOrder })
        ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");

        const sections = await applicant.getKnowledgeSections();
        expect(sections).toEqual(
          expect.arrayContaining(sectionsData.map(data => expect.objectContaining(data)))
        );
      });

      it("does not update if two experienceSections have the same displayOrder", async () => {
        const { uuid } = await ApplicantGenerator.instance.withMinimumData();
        const applicant = await ApplicantRepository.update({
          uuid,
          experienceSections: sectionsData
        });

        const sectionsDataWithSameDisplayOrder = [
          {
            ...sectionsData[0],
            displayOrder: 2
          },
          {
            ...sectionsData[0],
            displayOrder: 2
          }
        ];
        await expect(
          ApplicantRepository.update({ uuid, experienceSections: sectionsDataWithSameDisplayOrder })
        ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");

        const sections = await applicant.getExperienceSections();
        expect(sections).toEqual(
          expect.arrayContaining(sectionsData.map(data => expect.objectContaining(data)))
        );
      });
    });
  });

  describe("updateApprovalStatus", () => {
    let admin: Admin;
    beforeAll(async () => {
      admin = await AdminGenerator.extension();
    });

    const expectSuccessfulApplicantStatusUpdate = async (
      applicant: Applicant,
      status: ApprovalStatus
    ) => {
      return ApplicantRepository.updateApprovalStatus(admin.userUuid, applicant.uuid, status);
    };

    const expectApplicantWithApprovalStatus = async (approvalStatus: ApprovalStatus) => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const approvedApplicant = await expectSuccessfulApplicantStatusUpdate(
        applicant,
        approvalStatus
      );
      expect(approvedApplicant.approvalStatus).toEqual(approvalStatus);
    };

    const expectStatusUpdateToCreateOneEvent = async (approvalStatus: ApprovalStatus) => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const approvedApplicant = await expectSuccessfulApplicantStatusUpdate(
        applicant,
        approvalStatus
      );
      expect(await approvedApplicant.getApprovalEvents()).toEqual([
        expect.objectContaining({
          adminUserUuid: admin.userUuid,
          applicantUuid: approvedApplicant.uuid,
          status: approvalStatus
        })
      ]);
    };

    it("creates an applicant with a pending status", async () => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      expect(applicant.approvalStatus).toEqual(ApprovalStatus.pending);
    });

    it("allows admins to approve an applicant", async () => {
      await expectApplicantWithApprovalStatus(ApprovalStatus.approved);
    });

    it("allows admins to reject an applicant", async () => {
      await expectApplicantWithApprovalStatus(ApprovalStatus.rejected);
    });

    it("creates an event when approving an applicant", async () => {
      await expectStatusUpdateToCreateOneEvent(ApprovalStatus.approved);
    });

    it("creates an event when marking an applicant approval as pending", async () => {
      await expectStatusUpdateToCreateOneEvent(ApprovalStatus.pending);
    });

    it("creates an event when rejecting an applicant", async () => {
      await expectStatusUpdateToCreateOneEvent(ApprovalStatus.rejected);
    });

    it("creates four events by changing four times the applicant status", async () => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      await expectSuccessfulApplicantStatusUpdate(applicant, ApprovalStatus.pending);
      await expectSuccessfulApplicantStatusUpdate(applicant, ApprovalStatus.approved);
      await expectSuccessfulApplicantStatusUpdate(applicant, ApprovalStatus.rejected);
      await expectSuccessfulApplicantStatusUpdate(applicant, ApprovalStatus.pending);
      const events = await applicant.getApprovalEvents();
      expect(events).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            adminUserUuid: admin.userUuid,
            applicantUuid: applicant.uuid,
            status: ApprovalStatus.pending
          }),
          expect.objectContaining({
            adminUserUuid: admin.userUuid,
            applicantUuid: applicant.uuid,
            status: ApprovalStatus.approved
          }),
          expect.objectContaining({
            adminUserUuid: admin.userUuid,
            applicantUuid: applicant.uuid,
            status: ApprovalStatus.rejected
          }),
          expect.objectContaining({
            adminUserUuid: admin.userUuid,
            applicantUuid: applicant.uuid,
            status: ApprovalStatus.pending
          })
        ])
      );
    });

    it("throws an error if admin does not exist", async () => {
      const nonExistentAdminUserUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      await expect(
        ApplicantRepository.updateApprovalStatus(
          nonExistentAdminUserUuid,
          applicant.uuid,
          ApprovalStatus.approved
        )
      ).rejects.toThrowErrorWithMessage(
        ForeignKeyConstraintError,
        'insert or update on table "ApplicantApprovalEvents" violates ' +
          'foreign key constraint "ApplicantApprovalEvents_adminUserUuid_fkey"'
      );
    });

    it("throws an error if applicant does not exist", async () => {
      const nonExistentApplicantUuid = "4c925fdc-8fd4-47ed-9a24-fa81ed5cc9da";
      await expect(
        ApplicantRepository.updateApprovalStatus(
          admin.userUuid,
          nonExistentApplicantUuid,
          ApprovalStatus.approved
        )
      ).rejects.toThrowErrorWithMessage(
        ApplicantNotUpdatedError,
        ApplicantNotUpdatedError.buildMessage(nonExistentApplicantUuid)
      );
    });

    it("throws an error if applicantUuid has invalid format", async () => {
      await expect(
        ApplicantRepository.updateApprovalStatus(
          admin.userUuid,
          "InvalidFormat",
          ApprovalStatus.approved
        )
      ).rejects.toThrowErrorWithMessage(
        DatabaseError,
        'invalid input syntax for type uuid: "InvalidFormat"'
      );
    });

    it("throws an error if adminUserUuid has invalid format", async () => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      await expect(
        ApplicantRepository.updateApprovalStatus(
          "InvalidFormat",
          applicant.uuid,
          ApprovalStatus.approved
        )
      ).rejects.toThrowErrorWithMessage(
        ValidationError,
        "Validation error: uuid has invalid format"
      );
    });

    it("throws an error if status is not part of the enum values", async () => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      await expect(
        ApplicantRepository.updateApprovalStatus(
          admin.userUuid,
          applicant.uuid,
          "notDefinedValue" as ApprovalStatus
        )
      ).rejects.toThrowErrorWithMessage(ValidationError, isApprovalStatus.validate.isIn.msg);
    });

    it("does not update applicant status if it throws an error", async () => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      await expect(
        ApplicantRepository.updateApprovalStatus(
          admin.userUuid,
          applicant.uuid,
          "unknownStatus" as ApprovalStatus
        )
      ).rejects.toThrow();
      expect((await ApplicantRepository.findByUuid(applicant.uuid)).approvalStatus).toEqual(
        ApprovalStatus.pending
      );
    });

    it("does not create an event for the applicant if it throws an error", async () => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      await expect(
        ApplicantRepository.updateApprovalStatus(
          admin.userUuid,
          applicant.uuid,
          "unknownStatus" as ApprovalStatus
        )
      ).rejects.toThrow();
      expect(await applicant.getApprovalEvents()).toHaveLength(0);
    });
  });
});
