import faker from "faker";
import { IApplicant, TSection } from "../../../src/models/Applicant";
import { Career } from "../../../src/models/Career";

interface IApplicantsData {
  careers: Career[];
  capabilitiesDescriptions: string[];
  numberOfApplicantsData: number;
}

const applicantMocks = {
  applicantData: (
    careers: Career[],
    capabilitiesDescriptions: string[] = [],
    sections: TSection[] = []
  ): IApplicant => ({
    name: faker.name.firstName(),
    surname: faker.name.lastName(),
    padron: faker.random.number(),
    description: faker.random.words(),
    careers: careers.map(({ code, credits }) => ({ code, creditsCount: credits - 1 })),
    capabilities: capabilitiesDescriptions.length === 0 ?
      [faker.random.words()] : capabilitiesDescriptions,
    sections
  }),
  applicantsData: (
    {
      careers,
      capabilitiesDescriptions = [],
      numberOfApplicantsData
    }: IApplicantsData
  ) => (
    [...Array(numberOfApplicantsData)].map(
      _ => applicantMocks.applicantData(careers, capabilitiesDescriptions)
    )
  )
};

export { applicantMocks };
