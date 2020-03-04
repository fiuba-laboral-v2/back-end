import { CareerRepository } from "../../../src/models/Career";
import { ApplicantRepository, Errors, IApplicantEditable } from "../../../src/models/Applicant";

import Database from "../../../src/config/Database";
import { careerMocks } from "../Career/mocks";
import { applicantMocks } from "./mocks";
import { CapabilityRepository } from "../../../src/models/Capability";

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

  it("can delete an applicant by uuid", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    const savedApplicant = await ApplicantRepository.create(applicantData);

    await ApplicantRepository.deleteByUuid(savedApplicant.uuid);

    const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);

    expect(applicant).toBeNull();
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
    const createApplicant = async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);
      return ApplicantRepository.create(applicantData);
    };

    it("Should update all props", async () => {
      const applicant = await createApplicant();
      const newCareer = await CareerRepository.create(careerMocks.careerData());
      const newProps: IApplicantEditable = {
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
      const applicant = await createApplicant();
      const newProps: IApplicantEditable = { name: "newName" };
      await ApplicantRepository.update(applicant, newProps);
      expect(applicant).toEqual(expect.objectContaining({
        name: newProps.name
      }));
    });

    it("Should update surname", async () => {
      const applicant = await createApplicant();
      const newProps: IApplicantEditable = { surname: "newSurname" };
      await ApplicantRepository.update(applicant, newProps);
      expect(applicant).toEqual(expect.objectContaining({
        surname: newProps.surname
      }));
    });

    it("Should update description", async () => {
      const applicant = await createApplicant();
      const newProps: IApplicantEditable = { description: "newDescription" };
      await ApplicantRepository.update(applicant, newProps);
      expect(applicant).toEqual(expect.objectContaining({
        description: newProps.description
      }));
    });

    it("Should update adding new capacilities", async () => {
      const applicant = await createApplicant();
      const newProps: IApplicantEditable = { capabilities: ["CSS", "clojure"] };
      await ApplicantRepository.update(applicant, newProps);
      expect(
        applicant.capabilities.map(capability => capability.description)
      ).toEqual(expect.arrayContaining(["CSS", "clojure"]));
    });
  });
});
