import { ValidationError } from "sequelize";
import Database from "../../../src/config/Database";
import { CareerRepository } from "../../../src/models/Career";
import { ApplicantRepository, IApplicantEditable } from "../../../src/models/Applicant";
import { ApplicantCareersRepository } from "../../../src/models/ApplicantCareer/Repository";
import { UserRepository } from "../../../src/models/User/Repository";
import { CapabilityRepository } from "../../../src/models/Capability";
import { ApplicantNotFound } from "../../../src/models/Applicant/Errors/ApplicantNotFound";
import { ApplicantGenerator, TApplicantDataGenerator } from "../../generators/Applicant";
import { CareerGenerator, TCareerGenerator } from "../../generators/Career";
import { internet, random } from "faker";

describe("ApplicantRepository", () => {
  let applicantsMinimumData: TApplicantDataGenerator;
  let careers: TCareerGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await UserRepository.truncate();
    await CareerRepository.truncate();
    await CapabilityRepository.truncate();
    applicantsMinimumData = ApplicantGenerator.data.minimum();
    careers = CareerGenerator.model();
  });

  afterAll(() => Database.close());

  describe("Create", () => {
    it("creates a new applicant", async () => {
      const career = await careers.next().value;
      const applicantData = applicantsMinimumData.next().value;
      const applicant = await ApplicantRepository.create({
        ...applicantData,
        careers: [{ creditsCount: career.credits - 10, code: career.code }],
        capabilities: ["Python"]
      });
      const [applicantCareer] = await applicant.getCareers();

      expect(applicant).toEqual(expect.objectContaining({
        uuid: applicant.uuid,
        padron: applicantData.padron,
        description: applicantData.description
      }));
      expect(applicantCareer).toMatchObject({
        code: career.code,
        description: career.description,
        credits: career.credits,
        ApplicantCareer: {
          applicantUuid: applicant.uuid,
          careerCode: career.code,
          creditsCount: career.credits - 10
        }
      });
      const capabilities = await applicant.getCapabilities();
      const capabilityDescriptions = capabilities.map(c => c.description.toLowerCase());
      expect(capabilityDescriptions).toEqual(["Python".toLowerCase()]);
    });

    it("creates two valid applicant in the same career", async () => {
      const career = await careers.next().value;
      const applicantCareer = { code: career.code, creditsCount: career.credits - 10 };
      await ApplicantRepository.create({
        ...applicantsMinimumData.next().value,
        careers: [applicantCareer]
      });
      await expect(
        ApplicantRepository.create({
          ...applicantsMinimumData.next().value,
          careers: [applicantCareer]
        })
      ).resolves.not.toThrow(ApplicantNotFound);
    });

    it("creates an applicant without a career and without capabilities", async () => {
      const applicantData = applicantsMinimumData.next().value;
      const savedApplicant = await ApplicantRepository.create(applicantData);
      const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);
      expect((await applicant.getCareers())).toHaveLength(0);
      expect((await applicant.getCapabilities())).toHaveLength(0);
    });

    it("creates an applicant with capabilities", async () => {
      const applicantData = applicantsMinimumData.next().value;
      const applicant = await ApplicantRepository.create({
        ...applicantData,
        capabilities: ["Python"]
      });
      const [capability] = await applicant.getCapabilities();
      expect(capability.description).toEqual("Python");
    });

    it("creates applicant with a valid section with a title and a text", async () => {
      const applicant = await ApplicantRepository.create(applicantsMinimumData.next().value);
      await applicant.createSection({ title: "title", text: "text" });
      const [section] = await applicant.getSections();
      expect(section).toEqual(expect.objectContaining({ title: "title", text: "text" }));
    });

    describe("Transactions", () => {
      it("rollbacks transaction and throws error if no padron is given", async () => {
        const applicantData = applicantsMinimumData.next().value;
        delete applicantData.padron;
        await expect(
          ApplicantRepository.create(applicantData)
        ).rejects.toThrowErrorWithMessage(
          ValidationError,
          "notNull Violation: Applicant.padron cannot be null"
        );
      });
    });
  });

  describe("Get", () => {
    it("retrieves applicant by padron", async () => {
      const applicantData = applicantsMinimumData.next().value;
      const career = await careers.next().value;
      await ApplicantRepository.create({
        ...applicantData,
        careers: [{ creditsCount: career.credits - 10, code: career.code }],
        capabilities: ["Node"]
      });

      const applicant = await ApplicantRepository.findByPadron(applicantData.padron);

      expect(applicant).toEqual(expect.objectContaining({
        uuid: applicant.uuid,
        padron: applicantData.padron,
        description: applicantData.description
      }));

      const [applicantCareer] = await applicant.getCareers();
      expect(applicantCareer).toMatchObject({
        code: career.code,
        description: career.description,
        credits: career.credits,
        ApplicantCareer: {
          applicantUuid: applicant.uuid,
          careerCode: career.code,
          creditsCount: career.credits - 10
        }
      });

      const capabilities = await applicant.getCapabilities();
      const capabilityDescriptions = capabilities.map(c => c.description.toLowerCase());
      expect(capabilityDescriptions).toEqual(["Node".toLowerCase()]);
    });

    it("retrieves applicant by uuid", async () => {
      const applicantData = applicantsMinimumData.next().value;
      const career = await careers.next().value;
      const { uuid } = await ApplicantRepository.create({
        ...applicantData,
        careers: [{ creditsCount: career.credits - 10, code: career.code }],
        capabilities: ["GO"]
      });
      const applicant = await ApplicantRepository.findByUuid(uuid);

      expect(applicant).toEqual(expect.objectContaining({
        uuid: applicant.uuid,
        padron: applicantData.padron,
        description: applicantData.description
      }));

      const [applicantCareer] = await applicant.getCareers();
      expect(applicantCareer).toMatchObject({
        code: career.code,
        description: career.description,
        credits: career.credits,
        ApplicantCareer: {
          applicantUuid: applicant.uuid,
          careerCode: career.code,
          creditsCount: career.credits - 10
        }
      });
      const capabilities = await applicant.getCapabilities();
      const capabilityDescriptions = capabilities.map(c => c.description.toLowerCase());
      expect(capabilityDescriptions).toEqual(["GO".toLowerCase()]);
    });

    it("throws ApplicantNotFound if the applicant doesn't exists", async () => {
      const { padron } = applicantsMinimumData.next().value;
      await expect(ApplicantRepository.findByPadron(padron)).rejects.toThrow(ApplicantNotFound);
    });
  });

  describe("Update", () => {
    it("updates all props", async () => {
      const { code, credits } = await careers.next().value;
      const { uuid } = await ApplicantRepository.create({
        ...applicantsMinimumData.next().value,
        careers: [{ code, creditsCount: credits - 1 }]
      });
      const newCareer = await careers.next().value;
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
            code: newCareer.code,
            creditsCount: 8
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
      const user = await applicant.getUser();
      const capabilitiesDescription = [
        ...newProps.capabilities!,
        ...(await applicant.getCapabilities()).map(capability => capability.description)
      ];
      const careersCodes = [
        ...(await applicant.getCareers()).map(career => career.code),
        newCareer.code
      ];
      expect(applicant).toMatchObject({
        description: newProps.description
      });

      expect(user).toMatchObject({
        name: newProps.user!.name,
        surname: newProps.user!.surname
      });

      expect(
        (await applicant.getCapabilities()).map(capability => capability.description)
      ).toEqual(expect.arrayContaining(
        capabilitiesDescription
      ));
      expect(
        (await applicant.getCareers()).map(aCareer => aCareer.code)
      ).toEqual(expect.arrayContaining(careersCodes));
    });

    it("updates name", async () => {
      const { uuid } = await ApplicantRepository.create(applicantsMinimumData.next().value);
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
      const { uuid } = await ApplicantRepository.create(applicantsMinimumData.next().value);
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
      const { uuid } = await ApplicantRepository.create(applicantsMinimumData.next().value);
      const newProps: IApplicantEditable = {
        uuid,
        description: "newDescription"
      };
      const applicant = await ApplicantRepository.update(newProps);
      expect(applicant).toEqual(expect.objectContaining({
        description: newProps.description
      }));
    });

    it("updates by adding new capabilities", async () => {
      const applicant = await ApplicantRepository.create({
        ...applicantsMinimumData.next().value,
        capabilities: ["CSS", "clojure"]
      });

      expect(
        (await applicant.getCapabilities()).map(capability => capability.description)
      ).toEqual(expect.arrayContaining(["CSS", "clojure"]));

      const changeOneProps: IApplicantEditable = {
        uuid: applicant.uuid,
        capabilities: ["Python", "clojure"]
      };

      await ApplicantRepository.update(changeOneProps);
      expect(
        (await applicant.getCapabilities()).map(capability => capability.description)
      ).toEqual(expect.arrayContaining(["Python", "clojure"]));

    });

    it("updates by deleting all capabilities if none is provided", async () => {
      const applicant = await ApplicantRepository.create({
        ...applicantsMinimumData.next().value,
        capabilities: ["CSS", "clojure"]
      });

      expect(
        (await applicant.getCapabilities()).map(capability => capability.description)
      ).toEqual(expect.arrayContaining(["CSS", "clojure"]));

      await ApplicantRepository.update({ uuid: applicant.uuid });
      expect((await applicant.getCapabilities()).length).toEqual(0);
    });

    it("updates by keeping only the new careers", async () => {
      const applicant = await ApplicantRepository.create(applicantsMinimumData.next().value);
      const firstCareer = await careers.next().value;
      const secondCareer = await careers.next().value;
      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            code: firstCareer.code,
            creditsCount: 8
          },
          {
            code: secondCareer.code,
            creditsCount: 10
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

      const thirdCareer = await careers.next().value;
      const updatedProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            code: thirdCareer.code,
            creditsCount: 8
          },
          {
            code: secondCareer.code,
            creditsCount: 10
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
      const { uuid } = await ApplicantRepository.create(applicantsMinimumData.next().value);
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
      const { uuid } = await ApplicantRepository.create(applicantsMinimumData.next().value);
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
      const { uuid } = await ApplicantRepository.create(applicantsMinimumData.next().value);
      const linksData = [
        {
          name: random.word(),
          url: internet.url()
        },
        {
          name: "github",
          url: "https://github.com"
        }
      ];
      const applicant = await ApplicantRepository.update({ uuid, links: linksData });
      expect(
        (await applicant.getLinks()).map(({ url, name }) => ({ url, name }))
      ).toEqual(expect.arrayContaining(linksData));
      const newLinksData = [
        {
          name: "github",
          url: "https://github.com"
        },
        {
          name: "new name",
          url: internet.url()
        }
      ];
      const updatedApplicant = await ApplicantRepository.update({ uuid, links: newLinksData });
      expect(
        (await updatedApplicant.getLinks()).map(({ url, name }) => ({ url, name }))
      ).toEqual(expect.arrayContaining(newLinksData));
    });

    it("updates by deleting all links if none is provided", async () => {
      const { uuid } = await ApplicantRepository.create(applicantsMinimumData.next().value);
      const applicant = await ApplicantRepository.update({
        uuid,
        links: [
          {
            name: random.word(),
            url: internet.url()
          },
          {
            name: "new name",
            url: internet.url()
          }
        ]
      });
      await ApplicantRepository.update({ uuid });
      expect((await applicant.getLinks()).length).toEqual(0);
    });

    it("does not throw an error when adding an existing capability", async () => {
      const { uuid } = await ApplicantRepository.create({
        ...applicantsMinimumData.next().value,
        capabilities: ["GO"]
      });
      await expect(
        ApplicantRepository.update({ uuid, capabilities: ["GO"] })
      ).resolves.not.toThrow();
    });

    it("updates credits count of applicant careers", async () => {
      const career = await careers.next().value;
      const { uuid } = await ApplicantRepository.create({
        ...applicantsMinimumData.next().value,
        careers: [{ code: career.code, creditsCount: career.credits - 1 }]
      });
      const newApplicantCareerData = [
        {
          code: career.code,
          creditsCount: 100
        }
      ];
      await ApplicantRepository.update({ uuid, careers: newApplicantCareerData });

      const updatedApplicantCareer = await ApplicantCareersRepository.findByApplicantAndCareer(
        uuid,
        career.code
      );
      expect(updatedApplicantCareer.creditsCount).toEqual(100);
    });

    it("updates by deleting all applicant careers if none is provided", async () => {
      const career = await careers.next().value;
      const applicant = await ApplicantRepository.create({
        ...applicantsMinimumData.next().value,
        careers: [{ code: career.code, creditsCount: career.credits - 1 }]
      });
      const newApplicantCareerData = [{ code: career.code, creditsCount: 100 }];
      await ApplicantRepository.update({ uuid: applicant.uuid, careers: newApplicantCareerData });
      expect((await applicant.getCareers()).length).toEqual(1);
      await ApplicantRepository.update({ uuid: applicant.uuid });
      expect((await applicant.getCareers()).length).toEqual(0);
    });

    describe("with wrong parameters", () => {
      it("does not update if two sections have the same displayOrder", async () => {
        const { uuid } = await ApplicantRepository.create(applicantsMinimumData.next().value);
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
});
