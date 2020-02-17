import faker from "faker";
import { IApplicant } from "../../../src/models/Applicant";

const applicantMocks = {
  applicantData: (careersCodes: number[]): IApplicant => ({
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    padron: faker.random.number(),
    description: faker.random.words(),
    credits: faker.random.number(),
    careersCodes,
    capabilities: [faker.random.word()]
  })
};

export { applicantMocks };
