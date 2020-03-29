import faker from "faker";
import { IApplicant, TSection } from "../../../src/models/Applicant";

interface IApplicantsData {
  careersCodes: string[];
  capabilitiesDescriptions: string[];
  numberOfApplicantsData: number;
}

const applicantMocks = {
  applicantData: (
    careersCodes: string[],
    capabilitiesDescriptions: string[] = [],
    sections: TSection[] = []
  ): IApplicant => ({
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    padron: faker.random.number(),
    description: faker.random.words(),
    careers: careersCodes.map(c => ({ code: c, creditsCount: faker.random.number() })),
    capabilities: capabilitiesDescriptions.length === 0 ?
      [faker.random.words()] : capabilitiesDescriptions,
    sections
  }),
  applicantsData: (
    {
      careersCodes,
      capabilitiesDescriptions = [],
      numberOfApplicantsData
    }: IApplicantsData
  ) => (
      [...Array(numberOfApplicantsData)].map(
        _ => applicantMocks.applicantData(careersCodes, capabilitiesDescriptions)
      )
    )
};

export { applicantMocks };
