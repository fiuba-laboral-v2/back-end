import { ApplicantRepository, IApplicant, TSection } from "../../../src/models/Applicant";
import { Career } from "../../../src/models/Career";
import { IUser } from "../../../src/models/User";
import { TLink } from "../../../src/models/Applicant/Link/Interface";

const applicantMocks = {
  applicantData: (
    careers: Career[],
    capabilitiesDescriptions: string[] = [],
    sections: TSection[] = [],
    links: TLink[] = [],
    user?: IUser
  ): IApplicant => ({
    padron: 98539,
    description: "Programo en TypeScript",
    careers: careers.map(({ code, credits }) => ({ code, creditsCount: credits - 1 })),
    capabilities: capabilitiesDescriptions.length === 0 ? ["Python"] : capabilitiesDescriptions,
    sections,
    links,
    user: user || {
      email: "hello@gmail.com",
      password: "SecurePasword1010",
      name: "Sebastián Ezequiel",
      surname: "Blanco"
    }
  }),
  createFourApplicantsWithMinimumData: () => (
    Promise.all(
      [
        {
          padron: 98539,
          careers: [],
          user: {
            email: "sblanco@fi.uba.ar",
            password: "ASDqfdsfsdfwe234",
            name: "Sebastian",
            surname: "Blanco"
          }
        },
        {
          padron: 98225,
          careers: [],
          user: {
            email: "dalvarez@fi.uba.ar",
            password: "ASDqfedsfswe234",
            name: "Dylan",
            surname: "Alvarez"
          }
        },
        {
          padron: 95736,
          careers: [],
          user: {
            email: "mllauro@fi.uba.ar",
            password: "ASDfewfewqwe234",
            name: "Manuel",
            surname: "Llauro"
          }
        },
        {
          padron: 85539,
          careers: [],
          user: {
            email: "mbeiro@fi.uba.ar",
            password: "ASDqwegregrdfg234",
            name: "Mariano",
            surname: "Beiro"
          }
        }
      ].map(data => ApplicantRepository.create(data))
    )
  )
};

export { applicantMocks };
