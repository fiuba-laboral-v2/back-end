import faker from "faker";
import { ApplicantRepository, IApplicant, TSection } from "../../../src/models/Applicant";
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
    sections,
    user: {
      email: "hello@gmail.com",
      password: "SecurePasword1010"
    }
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
        {
          name: "Sebastian",
          surname: "Blanco",
          padron: 98539,
          careers: [],
          user: {
            email: "sblanco@fi.uba.ar",
            password: "ASDqwe234"
          }
        },
        {
          name: "Dylan",
          surname: "Alvarez",
          padron: 98225,
          careers: [],
          user: {
            email: "dalvarez@fi.uba.ar",
            password: "ASDqwe234"
          }
        },
        {
          name: "Manuel",
          surname: "Llauro",
          padron: 95736,
          careers: [],
          user: {
            email: "mllauro@fi.uba.ar",
            password: "ASDqwe234"
          }
        },
        {
          name: "Mariano",
          surname: "Beiro",
          padron: 85539,
          careers: [],
          user: {
            email: "mbeiro@fi.uba.ar",
            password: "ASDqwe234"
          }
        }
      ].map(data => ApplicantRepository.create(data))
    )
  )
};

export { applicantMocks };
