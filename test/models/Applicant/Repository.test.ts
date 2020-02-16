
import { CareerRepository } from "../../../src/models/Career";
import { ApplicantRepository } from "../../../src/models/Applicant";

import Database from "../../../src/config/Database";
import { careerMocks } from "../Career/mocks";
import { applicantMocks } from "./mocks";

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

    expect(applicant).toEqual(expect.objectContaining({
      uuid: applicant.uuid,
      name: applicantData.name,
      surname: applicantData.surname,
      padron: applicantData.padron,
      description: applicantData.description,
      credits: applicantData.credits
    }));
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
      description: applicantData.description,
      credits: applicantData.credits
    }));
    expect(applicant.careers[0].description).toEqual(career.description);
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
      description: applicantData.description,
      credits: applicantData.credits
    }));
    expect(applicant.careers[0].description).toEqual(career.description);
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
});
