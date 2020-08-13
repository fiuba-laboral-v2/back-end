import { DatabaseError, ForeignKeyConstraintError, ValidationError } from "sequelize";
import { CareerRepository } from "$models/Career";
import { ApplicantRepository, IApplicantEditable } from "$models/Applicant";
import { Admin, Applicant } from "$models";
import { ApplicantCareersRepository } from "$models/Applicant/ApplicantCareer";
import { UserRepository } from "$models/User";
import { CapabilityRepository } from "$models/Capability";
import { ApplicantNotFound, ApplicantNotUpdatedError } from "$models/Applicant/Errors";
import { FiubaUserNotFoundError } from "$models/User/Errors";
import { ApplicantGenerator } from "$generators/Applicant";
import { CareerGenerator } from "$generators/Career";
import { AdminGenerator } from "$generators/Admin";
import { ApprovalStatus, approvalStatuses } from "$models/ApprovalStatus";
import { FiubaUsersService } from "$services/FiubaUsers";
import { Secretary } from "$models/Admin";
import { UUID_REGEX } from "$test/models";
import {
  ForbiddenApprovedYearCountError,
  MissingApprovedSubjectCountError
} from "$models/Applicant/ApplicantCareer/Errors";

describe("ApplicantRepository", () => {
  beforeAll(async () => {
    await UserRepository.truncate();
    await CareerRepository.truncate();
    await CapabilityRepository.truncate();
  });

  describe("Create", () => {
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

      expect(applicant).toEqual(expect.objectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        padron: applicantData.padron,
        description: applicantData.description
      }));
      expect(applicantCareer).toEqual(expect.objectContaining(applicantCareerData));
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
      expect((await applicant.getCareers())).toHaveLength(0);
      expect((await applicant.getCapabilities())).toHaveLength(0);
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

    it("creates applicant with a valid section with a title and a text", async () => {
      const applicant = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      await applicant.createSection({ title: "title", text: "text" });
      const [section] = await applicant.getSections();
      expect(section).toEqual(expect.objectContaining({ title: "title", text: "text" }));
    });

    it("throws an error if no padron is given", async () => {
      const applicantData = ApplicantGenerator.data.minimum();
      delete applicantData.padron;
      await expect(
        ApplicantRepository.create(applicantData)
      ).rejects.toThrowErrorWithMessage(
        ValidationError,
        "notNull Violation: Applicant.padron cannot be null"
      );
    });

    it("throws an error it is not specified if the applicant is a graduate", async () => {
      const career = await CareerGenerator.instance();
      const applicantData = {
        ...ApplicantGenerator.data.minimum(),
        careers: [{
          careerCode: career.code,
          isGraduate: true
        }]
      };
      delete applicantData.careers[0].isGraduate;
      await expect(
        ApplicantRepository.create(applicantData)
      ).rejects.toThrowErrorWithMessage(
        DatabaseError,
        "null value in column \"isGraduate\" violates not-null constraint"
      );
    });

    it("throws an error if the FiubaService authentication returns false", async () => {
      const fiubaUsersServiceMock = jest.spyOn(FiubaUsersService, "authenticate");
      fiubaUsersServiceMock.mockResolvedValueOnce(Promise.resolve(false));

      const applicantData = ApplicantGenerator.data.minimum();
      await expect(
        ApplicantRepository.create(applicantData)
      ).rejects.toThrowErrorWithMessage(
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

      expect(applicant).toEqual(expect.objectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        padron: applicantData.padron,
        description: applicantData.description
      }));

      const [applicantCareer] = await applicant.getApplicantCareers();
      expect(applicantCareer).toEqual(expect.objectContaining(applicantCareerData));

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

      expect(applicant).toEqual(expect.objectContaining({
        uuid: expect.stringMatching(UUID_REGEX),
        padron: applicantData.padron,
        description: applicantData.description
      }));

      const [applicantCareer] = await applicant.getApplicantCareers();
      expect(applicantCareer).toEqual(expect.objectContaining(applicantCareerData));
      const capabilities = await applicant.getCapabilities();
      const capabilityDescriptions = capabilities.map(c => c.description.toLowerCase());
      expect(capabilityDescriptions).toEqual(["GO".toLowerCase()]);
    });

    it("throws ApplicantNotFound if the applicant doesn't exists", async () => {
      const { padron } = ApplicantGenerator.data.minimum();
      await expect(ApplicantRepository.findByPadron(padron)).rejects.toThrow(ApplicantNotFound);
    });
  });

  describe("Update", () => {
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
            approvedYearCount: 3,
            isGraduate: false
          }
        ],
        sections: [
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
      const user = await applicant.getUser();
      expect(applicant).toMatchObject({
        description: newProps.description
      });

      expect(user).toMatchObject(newProps.user!);

      expect(
        capabilities.map(c => c.description)
      ).toEqual(expect.arrayContaining(
        newProps.capabilities!
      ));
      expect(applicantCareers).toEqual([expect.objectContaining(newProps.careers![0])]);
    });

    it("updates name", async () => {
      const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const newProps: IApplicantEditable = {
        uuid,
        user: {
          name: "newName"
        }
      };
      const applicant = await ApplicantRepository.update(newProps);
      const user = await applicant.getUser();

      expect(user).toMatchObject({ name: newProps.user!.name });
    });

    it("updates surname", async () => {
      const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const newProps: IApplicantEditable = {
        uuid,
        user: {
          surname: "newSurname"
        }
      };
      const applicant = await ApplicantRepository.update(newProps);
      const user = await applicant.getUser();
      expect(user).toMatchObject({ surname: newProps.user!.surname });
    });

    it("updates description", async () => {
      const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const newProps: IApplicantEditable = {
        uuid,
        description: "newDescription"
      };
      const applicant = await ApplicantRepository.update(newProps);
      expect(applicant.description).toEqual(newProps.description);
    });

    it("updates by adding new capabilities", async () => {
      const applicant = await ApplicantRepository.create({
        ...ApplicantGenerator.data.minimum(),
        capabilities: ["CSS", "clojure"]
      });
      expect(
        (await applicant.getCapabilities()).map(c => c.description)
      ).toEqual(expect.arrayContaining(
        ["CSS", "clojure"]
      ));

      const changeOneProps: IApplicantEditable = {
        uuid: applicant.uuid,
        capabilities: ["Python", "clojure"]
      };

      await ApplicantRepository.update(changeOneProps);
      expect(
        (await applicant.getCapabilities()).map(c => c.description)
      ).toEqual(expect.arrayContaining(
        ["Python", "clojure"]
      ));

    });

    it("updates by deleting all capabilities if none is provided", async () => {
      const applicant = await ApplicantRepository.create({
        ...ApplicantGenerator.data.minimum(),
        capabilities: ["CSS", "clojure"]
      });

      expect(
        (await applicant.getCapabilities()).map(capability => capability.description)
      ).toEqual(expect.arrayContaining(
        ["CSS", "clojure"]
      ));

      await ApplicantRepository.update({ uuid: applicant.uuid });
      expect((await applicant.getCapabilities())).toHaveLength(0);
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
            approvedYearCount: 3,
            isGraduate: false
          },
          {
            careerCode: secondCareer.code,
            approvedSubjectCount: 20,
            approvedYearCount: 3,
            isGraduate: false
          }
        ]
      };

      const updatedApplicant = await ApplicantRepository.update(newProps);
      expect(
        (await updatedApplicant.getCareers()).map(career => career.code)
      ).toEqual(expect.arrayContaining([
        firstCareer.code,
        secondCareer.code
      ]));

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
      expect(
        (await updatedApplicant.getCareers()).map(career => career.code)
      ).toEqual(expect.arrayContaining([
        thirdCareer.code,
        secondCareer.code
      ]));
    });

    it("updates by keeping only the new sections", async () => {
      const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
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
      const applicant = await ApplicantRepository.update({ uuid, sections: sectionsData });

      const initialSections = await applicant.getSections();

      expect(
        initialSections.map(
          ({ title, text, displayOrder }) => ({ title, text, displayOrder })
        )
      ).toEqual(expect.arrayContaining(sectionsData));

      const updatedSectionsData = [
        {
          uuid: initialSections.find(({ title }) => title === "second section")!.uuid,
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

      const updatedApplicant = await ApplicantRepository.update({
        uuid: applicant.uuid,
        sections: updatedSectionsData
      });
      const updatedSections = await updatedApplicant.getSections();
      expect(
        updatedSections.map(
          ({ title, text, displayOrder }) => ({ title, text, displayOrder })
        )
      ).toEqual(expect.arrayContaining(
        updatedSectionsData.map(
          ({ title, text, displayOrder }) => ({ title, text, displayOrder })
        )
      ));
    });

    it("updates deleting all sections if none is provided", async () => {
      const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
      const sectionsData = [
        {
          title: "myTitle",
          text: "some description",
          displayOrder: 1
        },
        {
          title: "new myTitle",
          text: "new some description",
          displayOrder: 2
        }
      ];
      await ApplicantRepository.update({ uuid, sections: sectionsData });
      const updatedApplicant = await ApplicantRepository.update({ uuid, sections: [] });
      expect((await updatedApplicant.getSections()).length).toEqual(0);
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
      const applicant = await ApplicantRepository.update({ uuid, links: linksData });
      expect(
        (await applicant.getLinks()).map(({ url, name }) => ({ url, name }))
      ).toEqual(expect.arrayContaining(linksData));
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
      const updatedApplicant = await ApplicantRepository.update({ uuid, links: newLinksData });
      expect(
        (await updatedApplicant.getLinks()).map(({ url, name }) => ({ url, name }))
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

    it("updates approvedYearCount and approvedSubjectCount of applicant careers", async () => {
      const career = await CareerGenerator.instance();
      const { uuid } = await ApplicantRepository.create({
        ...ApplicantGenerator.data.minimum(),
        careers: [{
          careerCode: career.code,
          isGraduate: false,
          approvedYearCount: 2,
          approvedSubjectCount: 10
        }]
      });
      const newApplicantCareerData = {
        careerCode: career.code,
        approvedYearCount: 3,
        approvedSubjectCount: 17,
        isGraduate: false
      };
      await ApplicantRepository.update({ uuid, careers: [newApplicantCareerData] });

      const updatedApplicantCareer = await ApplicantCareersRepository.findByApplicantAndCareer(
        uuid,
        career.code
      );
      expect(updatedApplicantCareer).toEqual(expect.objectContaining(newApplicantCareerData));
    });

    it("updates by deleting all applicant careers if none is provided", async () => {
      const career = await CareerGenerator.instance();
      const applicant = await ApplicantRepository.create({
        ...ApplicantGenerator.data.minimum(),
        careers: [{ careerCode: career.code, isGraduate: true }]
      });
      const newApplicantCareerData = [{ careerCode: career.code, isGraduate: true }];
      await ApplicantRepository.update({ uuid: applicant.uuid, careers: newApplicantCareerData });
      expect((await applicant.getCareers()).length).toEqual(1);
      await ApplicantRepository.update({ uuid: applicant.uuid });
      expect((await applicant.getCareers()).length).toEqual(0);
    });

    describe("with wrong parameters", () => {
      it("throws an error if approvedYearCount is present for a graduated", async () => {
        const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
        const { code: careerCode } = await CareerGenerator.instance();
        const dataToUpdate = {
          uuid,
          careers: [{
            careerCode,
            approvedYearCount: 3,
            isGraduate: true
          }]
        };
        await expect(
          ApplicantRepository.update(dataToUpdate)
        ).rejects.toThrowBulkRecordErrorIncluding([{
          errorClass: ValidationError,
          message: ForbiddenApprovedYearCountError.buildMessage()
        }]);
      });

      it("throws an error if approvedSubjectCount is missing for a non graduate", async () => {
        const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
        const { code: careerCode } = await CareerGenerator.instance();
        const dataToUpdate = {
          uuid,
          careers: [{
            careerCode,
            approvedYearCount: 3,
            isGraduate: false
          }]
        };
        await expect(
          ApplicantRepository.update(dataToUpdate)
        ).rejects.toThrowBulkRecordErrorIncluding([{
          errorClass: ValidationError,
          message: MissingApprovedSubjectCountError.buildMessage()
        }]);
      });

      it("does not update if two sections have the same displayOrder", async () => {
        const { uuid } = await ApplicantRepository.create(ApplicantGenerator.data.minimum());
        const sectionsData = [
          {
            title: "myTitle",
            text: "some description",
            displayOrder: 1
          },
          {
            title: "new myTitle",
            text: "new some description",
            displayOrder: 2
          }
        ];
        const applicant = await ApplicantRepository.update({ uuid, sections: sectionsData });

        const newSectionsData = [
          {
            title: "myTitle",
            text: "some description",
            displayOrder: 2
          },
          {
            title: "new myTitle",
            text: "new some description",
            displayOrder: 2
          }
        ];
        await expect(
          ApplicantRepository.update({ uuid: applicant.uuid, sections: newSectionsData })
        ).rejects.toThrow();

        const sections = await applicant.getSections();
        expect(
          sections.map(
            ({ title, text, displayOrder }) => ({ title, text, displayOrder })
          )
        ).toEqual(expect.arrayContaining(sectionsData));
      });
    });
  });

  describe("updateApprovalStatus", () => {
    let admin: Admin;
    beforeAll(async () => {
      admin = await AdminGenerator.instance(Secretary.extension);
    });

    const expectSuccessfulApplicantStatusUpdate = async (
      applicant: Applicant,
      status: ApprovalStatus
    ) => {
      return ApplicantRepository.updateApprovalStatus(
        admin.userUuid,
        applicant.uuid,
        status
      );
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
      expect(events).toEqual(expect.arrayContaining([
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
      ]));
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
        "insert or update on table \"ApplicantApprovalEvents\" violates " +
        "foreign key constraint \"ApplicantApprovalEvents_adminUserUuid_fkey\""
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
        "invalid input syntax for type uuid: \"InvalidFormat\""
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
      ).rejects.toThrowErrorWithMessage(
        ValidationError,
        `ApprovalStatus must be one of these values: ${approvalStatuses}`
      );
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
      expect(
        (await ApplicantRepository.findByUuid(applicant.uuid)).approvalStatus
      ).toEqual(ApprovalStatus.pending);
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
