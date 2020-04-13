import faker from "faker";
import { IApplicant, TSection, ApplicantRepository } from "../../../src/models/Applicant";
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
  ),
  createFourApplicantsWithMinimumData: () => (
    Promise.all(
      [
        { name: "Sebastian", surname: "Blanco", padron: 98539, careers: [] },
        { name: "Dylan", surname: "Alvarez", padron: 98225, careers: [] },
        { name: "Manuel", surname: "Llauro", padron: 95736, careers: [] },
        { name: "Mariano", surname: "Beiro", padron: 85539, careers: [] }
      ].map(data => ApplicantRepository.create(data))
    )
  )
};

export { applicantMocks };
