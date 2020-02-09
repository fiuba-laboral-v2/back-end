
import { Career, CareerRepository } from "../../../src/models/Career";
import { Applicant, ApplicantRepository } from "../../../src/models/Applicant";
import { CareerApplicant } from "../../../src/models/CareerApplicant";
import { ApplicantCapability } from "../../../src/models/ApplicantCapability";

import Database from "../../../src/config/Database";
import { careerMocks } from "../Career/mocks";
import { applicantMocks } from "./mocks";
import map from "lodash/map";

describe("ApplicantRepository", () => {
  const careerData = careerMocks.careerData();
  const applicantData = applicantMocks.applicantData([careerData.code]);

  beforeAll(async () => {
    await Database.setConnection();
  });

  beforeEach(async () => {
    await CareerRepository.truncate();
    await ApplicantRepository.truncate();
    await CareerApplicant.destroy({ truncate: true });
    await ApplicantCapability.destroy({ truncate: true });
  });

  afterAll(async () => {
    await Database.close();
  });

  it("creates a new applicant", async () => {
    const career = await CareerRepository.create(careerData);
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
  });
});
