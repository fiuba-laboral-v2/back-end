import { Applicant } from "./index";
import { CareerApplicantSerializer } from "../CareerApplicant";

import pick from "lodash/pick";

const ApplicantSerializer = {
  serialize: async (applicant: Applicant) => ({
    uuid: applicant.uuid,
    name: applicant.name,
    surname: applicant.surname,
    padron: applicant.padron,
    description: applicant.description,
    careers: await Promise.all((await applicant.getCareersApplicants()).map(
      async careerApplicant => CareerApplicantSerializer.serialize(careerApplicant)
    )),
    capabilities: (await applicant.getCapabilities()).map(
      capability => pick(capability, ["uuid", "description"])
    )
  })
};

export { ApplicantSerializer };
