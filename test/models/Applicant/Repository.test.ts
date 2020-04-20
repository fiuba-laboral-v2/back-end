import Database from "../../../src/config/Database";
import { CareerRepository } from "../../../src/models/Career";
import { ApplicantRepository, Errors, IApplicantEditable } from "../../../src/models/Applicant";
import { CareerApplicantRepository } from "../../../src/models/CareerApplicant/Repository";
import { CareerApplicantNotFound } from "../../../src/models/CareerApplicant/Errors";
import { CapabilityRepository } from "../../../src/models/Capability";
import { internet, random } from "faker";
import { careerMocks } from "../Career/mocks";
import { capabilityMocks } from "../Capability/mocks";
import { applicantMocks } from "./mocks";
import { UserRepository } from "../../../src/models/User/Repository";

describe("ApplicantRepository", () => {
  beforeAll(() => Database.setConnection());

  beforeEach(async () => {
    await CareerApplicantRepository.truncate();
    await UserRepository.truncate();
    await CareerRepository.truncate();
    await CapabilityRepository.truncate();
  });

  afterAll(() => Database.close());

  describe("Create", () => {
    it("creates a new applicant", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([ career ]);
      const applicant = await ApplicantRepository.create(applicantData);
      const applicantCareers = await applicant.getCareers();

      expect(applicant).toEqual(expect.objectContaining({
        uuid: applicant.uuid,
        name: applicantData.name,
        surname: applicantData.surname,
        padron: applicantData.padron,
        description: applicantData.description
      }));
      expect(applicantCareers[0]).toMatchObject({
        code: career.code,
        description: career.description,
        credits: career.credits,
        CareerApplicant: {
          applicantUuid: applicant.uuid,
          careerCode: career.code,
          creditsCount: applicantData.careers[0].creditsCount
        }
      });
      expect((await applicant.getCareers())[0].description).toEqual(career.description);
      expect(
        (await applicant.getCapabilities())[0].description
      ).toEqual(
        applicantData.capabilities[0]
      );
    });

    it("should create two valid applicant in the same career", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      await ApplicantRepository.create(applicantMocks.applicantData([ career ]));
      await expect(
        ApplicantRepository.create({
          ...applicantMocks.applicantData([ career ]),
          user: {
            email: "fds@gmail.com",
            password: "FDSFfdgfrt45"
          }
        })
      ).resolves.not.toThrow(Errors.ApplicantNotFound);
    });

    it("can create an applicant without a career and without capabilities", async () => {
      const applicantData = applicantMocks.applicantData([]);
      const savedApplicant = await ApplicantRepository.create({
        ...applicantData,
        capabilities: []
      });

      const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);

      expect(applicant).not.toBeNull();
    });

    describe("Transactions", () => {
      it("should rollback transaction and throw error if name is large", async () => {
        const career = await CareerRepository.create(careerMocks.careerData());
        const applicantData = applicantMocks.applicantData([ career ]);
        applicantData.name = "and the transaction will rolback because it is large";
        await expect(
          ApplicantRepository.create(applicantData)
        ).rejects.toThrow();
      });
    });
  });

  describe("Get", () => {
    it("can retreive an applicant by padron", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([ career ]);
      await ApplicantRepository.create(applicantData);

      const applicant = await ApplicantRepository.findByPadron(applicantData.padron);

      expect(applicant).toEqual(expect.objectContaining({
        uuid: applicant.uuid,
        name: applicantData.name,
        surname: applicantData.surname,
        padron: applicantData.padron,
        description: applicantData.description
      }));

      const applicantCareers = await applicant.getCareers();
      expect(applicantCareers[0]).toMatchObject({
        code: career.code,
        description: career.description,
        credits: career.credits,
        CareerApplicant: {
          applicantUuid: applicant.uuid,
          careerCode: career.code,
          creditsCount: applicantData.careers[0].creditsCount
        }
      });
      expect(
        (await applicant.getCapabilities())[0].description
      ).toEqual(
        applicantData.capabilities[0]
      );
    });

    it("can retrieve an applicant by uuid", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([ career ]);
      const savedApplicant = await ApplicantRepository.create(applicantData);

      const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);

      expect(applicant).toEqual(expect.objectContaining({
        uuid: applicant.uuid,
        name: applicantData.name,
        surname: applicantData.surname,
        padron: applicantData.padron,
        description: applicantData.description
      }));

      const applicantCareers = await applicant.getCareers();
      expect(applicantCareers[0]).toMatchObject({
        code: career.code,
        description: career.description,
        credits: career.credits,
        CareerApplicant: {
          applicantUuid: applicant.uuid,
          careerCode: career.code,
          creditsCount: applicantData.careers[0].creditsCount
        }
      });
      expect(
        (await applicant.getCapabilities())[0].description
      ).toEqual(
        applicantData.capabilities[0]
      );
    });

    it("should throw ApplicantNotFound if the aplicant doesn't exists", async () => {
      const applicantData = applicantMocks.applicantData([]);

      await expect(ApplicantRepository.findByPadron(applicantData.padron))
        .rejects.toThrow(Errors.ApplicantNotFound);
    });
  });

  describe("Update", () => {
    const createApplicant = async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([ career ]);
      return ApplicantRepository.create(applicantData);
    };

    it("Should update all props", async () => {
      const { uuid } = await createApplicant();
      const newCareer = await CareerRepository.create(careerMocks.careerData());
      const newProps: IApplicantEditable = {
        uuid,
        name: "newName",
        surname: "newSurname",
        description: "newDescription",
        capabilities: [ "CSS", "clojure" ],
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
      const capabilitiesDescription = [
        ...newProps.capabilities,
        ...(await applicant.getCapabilities()).map(capability => capability.description)
      ];
      const careersCodes = [
        ...(await applicant.getCareers()).map(career => career.code),
        newCareer.code
      ];
      expect(applicant).toMatchObject({
        name: newProps.name,
        surname: newProps.surname,
        description: newProps.description
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

    it("Should update name", async () => {
      const { uuid } = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid,
        name: "newName"
      };
      const applicant = await ApplicantRepository.update(newProps);

      expect(applicant).toMatchObject({
        name: newProps.name
      });
    });

    it("Should update surname", async () => {
      const { uuid } = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid,
        surname: "newSurname"
      };
      const applicant = await ApplicantRepository.update(newProps);
      expect(applicant).toMatchObject({
        surname: newProps.surname
      });
    });

    it("Should update description", async () => {
      const { uuid } = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid,
        description: "newDescription"
      };
      const applicant = await ApplicantRepository.update(newProps);
      expect(applicant).toEqual(expect.objectContaining({
        description: newProps.description
      }));
    });

    it("Should update by adding new capabilities", async () => {
      const { uuid } = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid,
        capabilities: [ "CSS", "clojure" ]
      };
      const applicant = await ApplicantRepository.update(newProps);
      expect(
        (await applicant.getCapabilities()).map(capability => capability.description)
      ).toEqual(expect.arrayContaining([ "CSS", "clojure" ]));
    });

    it("Should update by deleting all capabilities if none is provided", async () => {
      const { uuid } = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid,
        capabilities: [ "CSS", "clojure" ]
      };
      const applicant = await ApplicantRepository.update(newProps);
      expect(
        (await applicant.getCapabilities()).map(capability => capability.description)
      ).toEqual(expect.arrayContaining([ "CSS", "clojure" ]));

      await ApplicantRepository.update({ uuid });
      expect((await applicant.getCapabilities()).length).toEqual(0);
    });


    it("Should update by keeping only the new careers", async () => {
      const applicant = await createApplicant();
      const newCareer = await CareerRepository.create(careerMocks.careerData());
      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            code: newCareer.code,
            creditsCount: 8
          }
        ]
      };

      const updatedApplicant = await ApplicantRepository.update(newProps);
      expect(
        (await updatedApplicant.getCareers()).map(career => career.code)
      ).toEqual(expect.arrayContaining([
        newCareer.code
      ]));
    });

    it("should update by keeping only the new sections", async () => {
      const applicant = await createApplicant();

      const props: IApplicantEditable = {
        uuid: applicant.uuid,
        sections: [ {
          title: "myTitle",
          text: "some description",
          displayOrder: 1
        } ]
      };

      await ApplicantRepository.update(props);

      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        sections: [ {
          title: "new myTitle",
          text: "new some description",
          displayOrder: 2
        } ]
      };
      const updatedApplicant = await ApplicantRepository.update(newProps);
      expect(
        (await updatedApplicant.getSections()).map(section => section.title)
      ).toEqual(expect.arrayContaining([
        ...newProps.sections.map(section => section.title)
      ]));
    });

    it("should update deleting all sections if none is provided", async () => {
      const applicant = await createApplicant();

      const props: IApplicantEditable = {
        uuid: applicant.uuid,
        sections: [
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
        ]
      };

      await ApplicantRepository.update(props);

      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        sections: []
      };
      const updatedApplicant = await ApplicantRepository.update(newProps);
      expect((await updatedApplicant.getSections()).length).toEqual(0);
    });

    it("Should update by keeping only the new links", async () => {
      const applicant = await createApplicant();

      const props: IApplicantEditable = {
        uuid: applicant.uuid,
        links: [ {
          name: random.word(),
          url: internet.url()
        } ]
      };

      await ApplicantRepository.update(props);

      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        links: [ {
          name: "new name",
          url: internet.url()
        } ]
      };
      const updatedApplicant = await ApplicantRepository.update(newProps);
      expect(
        (await updatedApplicant.getLinks()).map(link => link.name)
      ).toEqual(expect.arrayContaining([
        ...newProps.links.map(link => link.name)
      ]));
    });

    it("should update deleting all links if none is provided", async () => {
      const applicant = await createApplicant();

      const props: IApplicantEditable = {
        uuid: applicant.uuid,
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
      };

      await ApplicantRepository.update(props);

      const newProps: IApplicantEditable = {
        uuid: applicant.uuid
      };
      await ApplicantRepository.update(newProps);
      expect((await applicant.getLinks()).length).toEqual(0);
    });

    it("should not throw an error when adding an existing capability", async () => {
      const applicant = await createApplicant();
      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        capabilities: [ (await applicant.getCapabilities())[0].description ]
      };
      await expect(ApplicantRepository.update(newProps)).resolves.not.toThrow();
    });

    it("Should update credits count of applicant careers", async () => {
      const applicant = await createApplicant();
      const [ career ] = await applicant.getCareers();
      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            code: career.code,
            creditsCount: 100
          }
        ]
      };
      await ApplicantRepository.update(newProps);

      const careerApplicant = await CareerApplicantRepository.findByApplicantAndCareer(
        applicant.uuid, career.code
      );
      expect(careerApplicant.creditsCount).toEqual(newProps.careers[0].creditsCount);
    });

    it("Should update by deleting all applicant careers if none is provided", async () => {
      const applicant = await createApplicant();
      const [ career ] = await applicant.getCareers();
      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            code: career.code,
            creditsCount: 100
          }
        ]
      };
      await ApplicantRepository.update(newProps);

      const careerApplicant = await CareerApplicantRepository.findByApplicantAndCareer(
        applicant.uuid, career.code
      );
      expect(careerApplicant.creditsCount).toEqual(newProps.careers[0].creditsCount);

      await ApplicantRepository.update({ uuid: applicant.uuid });

      expect((await applicant.getCareers()).length).toEqual(0);
    });
  });
});
