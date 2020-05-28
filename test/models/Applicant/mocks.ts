import { IApplicant, TSection } from "../../../src/models/Applicant";
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
  })
};

export { applicantMocks };
