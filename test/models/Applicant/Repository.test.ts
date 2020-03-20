import { CareerRepository } from "../../../src/models/Career";
import { ApplicantRepository, Errors, IApplicantEditable } from "../../../src/models/Applicant";

import Database from "../../../src/config/Database";
import { careerMocks } from "../Career/mocks";
import { capabilityMocks } from "../Capability/mocks";
import { applicantMocks } from "./mocks";
import { CareerApplicantRepository } from "../../../src/models/CareerApplicant/Repository";

describe("ApplicantRepository", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  afterAll(async () => {
    await Database.close();
  });

  it("creates a new applicant", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
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
    expect(applicant.careers[0].description).toEqual(career.description);
    expect(applicant.capabilities[0].description).toEqual(applicantData.capabilities[0]);
  });

  it("should create two valid applicant in the same career", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    await ApplicantRepository.create(applicantMocks.applicantData([career.code]));
    await expect(
      ApplicantRepository.create(applicantMocks.applicantData([career.code]))
    ).resolves.not.toThrow(Errors.ApplicantNotFound);
  });

  it("can retreive an applicant by padron", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
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
    expect(applicant.capabilities[0].description).toEqual(applicantData.capabilities[0]);
  });

  it("can retreive an applicant by uuid", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
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
    expect(applicant.capabilities[0].description).toEqual(applicantData.capabilities[0]);
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

  it("raise ApplicantNotFound if the aplicant doesn't exists", async () => {
    const applicantData = applicantMocks.applicantData([]);

    await expect(ApplicantRepository.findByPadron(applicantData.padron))
      .rejects.toThrow(Errors.ApplicantNotFound);
  });

  describe("Update", () => {
    const createApplicant = async ()  => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);
      return ApplicantRepository.create(applicantData);
    };

    it("Should update all props", async () => {
      const padron = (await createApplicant()).padron;
      const applicant = await ApplicantRepository.findByPadron(padron);
      const newCareer = await CareerRepository.create(careerMocks.careerData());
      const newProps: IApplicantEditable = {
        padron: applicant.padron,
        name: "newName",
        surname: "newSurname",
        description: "newDescription",
        capabilities: ["CSS", "clojure"],
        careers: [
          {
            code: newCareer.code,
            creditsCount: 8
          }
        ]
      };
      await ApplicantRepository.update(applicant, newProps);
      const capabilitiesDescription = [
        ...newProps.capabilities,
        ...applicant.capabilities.map(capability => capability.description)
      ];
      const careersCodes = [
        ...applicant.careers.map(career => career.code),
        newCareer.code
      ];
      expect(applicant).toEqual(expect.objectContaining({
        name: newProps.name,
        surname: newProps.surname,
        description: newProps.description
      }));

      expect(
        applicant.capabilities.map(capability => capability.description)
      ).toEqual(expect.arrayContaining(
        capabilitiesDescription
      ));
      expect(
        applicant.careers.map(aCareer => aCareer.code)
      ).toEqual(expect.arrayContaining(careersCodes));
    });

    it("Should update name", async () => {
      const padron = (await createApplicant()).padron;
      const applicant = await ApplicantRepository.findByPadron(padron);
      const newProps: IApplicantEditable = {
        padron: applicant.padron,
        name: "newName"
      };
      await ApplicantRepository.update(applicant, newProps);
      expect(applicant).toEqual(expect.objectContaining({
        name: newProps.name
      }));
    });

    it("Should update surname", async () => {
      const padron = (await createApplicant()).padron;
      const applicant = await ApplicantRepository.findByPadron(padron);
      const newProps: IApplicantEditable = {
        padron: applicant.padron,
        surname: "newSurname"
      };
      await ApplicantRepository.update(applicant, newProps);
      expect(applicant).toEqual(expect.objectContaining({
        surname: newProps.surname
      }));
    });

    it("Should update description", async () => {
      const padron = (await createApplicant()).padron;
      const applicant = await ApplicantRepository.findByPadron(padron);
      const newProps: IApplicantEditable = {
        padron: applicant.padron,
        description: "newDescription"
      };
      await ApplicantRepository.update(applicant, newProps);
      expect(applicant).toEqual(expect.objectContaining({
        description: newProps.description
      }));
    });

    it("Should update by adding new capacilities", async () => {
      const padron = (await createApplicant()).padron;
      const applicant = await ApplicantRepository.findByPadron(padron);
      const newProps: IApplicantEditable = {
        padron: applicant.padron,
        capabilities: ["CSS", "clojure"]
      };
      await ApplicantRepository.update(applicant, newProps);
      expect(
        applicant.capabilities.map(capability => capability.description)
      ).toEqual(expect.arrayContaining(["CSS", "clojure"]));
    });

    it("Should update by adding new careers", async () => {
      const padron = (await createApplicant()).padron;
      const applicant = await ApplicantRepository.findByPadron(padron);
      const newCareer = await CareerRepository.create(careerMocks.careerData());
      const newProps: IApplicantEditable = {
        padron: applicant.padron,
        careers: [
          {
            code: newCareer.code,
            creditsCount: 8
          }
        ]
      };
      await ApplicantRepository.update(applicant, newProps);
      expect(
        applicant.careers.map(career => career.code)
      ).toEqual(expect.arrayContaining([
        ...applicant.careers.map(career => career.code),
        newCareer.code
      ]));
    });

    it("Should not raise an error when adding an existing capability", async () => {
      const padron = (await createApplicant()).padron;
      const applicant = await ApplicantRepository.findByPadron(padron);
      const newProps: IApplicantEditable = {
        padron: applicant.padron,
        capabilities: [applicant.capabilities[0].description]
      };
      await expect(ApplicantRepository.update(applicant, newProps)).resolves.not.toThrow();
    });

    it("Should update credits count of applicant careers", async () => {
      const padron = (await createApplicant()).padron;
      const applicant = await ApplicantRepository.findByPadron(padron);
      const career = applicant.careers[0];
      const newProps: IApplicantEditable = {
        padron: applicant.padron,
        careers: [
          {
            code: career.code,
            creditsCount: 100
          }
        ]
      };
      await ApplicantRepository.update(applicant, newProps);

      const careerApplicant = await CareerApplicantRepository.findByApplicantAndCareer(
        applicant.uuid, career.code
      );
      expect(careerApplicant.creditsCount).toEqual(newProps.careers[0].creditsCount);
    });
  });

  describe("Delete", () => {
    it("should delete an applicant by uuid", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);
      const savedApplicant = await ApplicantRepository.create(applicantData);

      await ApplicantRepository.deleteByUuid(savedApplicant.uuid);

      const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);

      expect(applicant).toBeNull();
    });

    it("should delete all applicant capabilities", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const capabilities = capabilityMocks.capabilitiesData({ size: 3 });
      const applicantData = applicantMocks.applicantData(
        [career.code],
        capabilities.map(c => c.description)
      );
      const applicant = await ApplicantRepository.create(applicantData);

      expect(applicant.capabilities.length).toEqual(capabilities.length);

      await ApplicantRepository.deleteCapabilities(
        applicant, capabilities.map(c => c.description)
      );
      expect(applicant.capabilities.length).toEqual(0);
    });

    it("should delete all applicant careers", async () => {
      const careers = await careerMocks.createCareers(10);
      const codes = careers.map(c => c.code);
      const applicantData = applicantMocks.applicantData(codes);
      const applicant = await ApplicantRepository.create(applicantData);
      expect(applicant.careers.length).toEqual(careers.length);
      await ApplicantRepository.deleteCareers(applicant, codes);
      expect(applicant.careers.length).toEqual(0);
    });

    it("should not delete when deleting a not existing applicant capability", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData(
        [career.code],
        ["capability_1"]);
      const applicant = await ApplicantRepository.create(applicantData);
      const numberOfCapabilitiesBefore = applicant.capabilities.length;
      await ApplicantRepository.deleteCapabilities(
        applicant,
        ["not existing description"]
      );
      expect(applicant.capabilities.length).toEqual(numberOfCapabilitiesBefore);
    });
  });
});
