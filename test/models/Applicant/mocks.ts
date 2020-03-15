import faker from "faker";
import { IApplicant } from "../../../src/models/Applicant";
import map from "lodash/map";

const applicantMocks = {
  applicantData: (careersCodes: string[], capabilitiesDescriptions: string[] = []): IApplicant => ({
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    padron: faker.random.number(),
    description: faker.random.words(),
    careers: map(careersCodes, c => ({ code: c, creditsCount: faker.random.number()})),
    capabilities: capabilitiesDescriptions.length === 0 ?
      [faker.random.words()]: capabilitiesDescriptions
  })
};

export { applicantMocks };
