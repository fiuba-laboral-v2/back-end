import { Applicant } from "./index";

import map from "lodash/map";
import pick from "lodash/pick";

const applicantCareerMapper = async (applicant: Applicant) => {
  const careers = await applicant.getCareers();
  return map(careers, career => ({
    code: career.code,
    description: career.description,
    credits: career.credits,
    creditsCount: career.CareerApplicant.creditsCount
  }));
};

const ApplicantSerializer = {
  serialize: (applicant: Applicant) => ({
    name: applicant.name,
    surname: applicant.surname,
    padron: applicant.padron,
    description: applicant.description,
    careers: applicantCareerMapper(applicant),
    capabilities: map(
      applicant.capabilities,
      capability => pick(capability, ["uuid", "description"])
    )
  })
};

export { ApplicantSerializer };
