import faker from "faker";
import { IApplicant } from "../../../src/models/Applicant";

interface IApplicantsData {
  careersCodes: string[];
  capabilitiesDescriptions: string[];
  numberOfApplicantsData: number;
}

const applicantMocks = {
  applicantData: (
    careersCodes: string[],
    capabilitiesDescriptions: string[] = []
  ): IApplicant => ({
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    padron: faker.random.number(),
    description: faker.random.words(),
    careers: careersCodes.map(c => ({ code: c, creditsCount: faker.random.number() })),
    capabilities: capabilitiesDescriptions.length === 0 ?
      [faker.random.words()]: capabilitiesDescriptions
  }),
  applicantsData: (
    {
      careersCodes,
      capabilitiesDescriptions = [],
      numberOfApplicantsData
    }: IApplicantsData
  ) => (
    [ ...Array(numberOfApplicantsData) ].map(
      _ => applicantMocks.applicantData(careersCodes, capabilitiesDescriptions)
    )
  )
};

export { applicantMocks };
