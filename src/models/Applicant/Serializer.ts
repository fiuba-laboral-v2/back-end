import { Applicant } from "./index";

import map from "lodash/map";
import pick from "lodash/pick";

const applicantCareerMapper = (applicant: Applicant) => {
  return map(applicant.careers, career => ({
    code: career.code,
    description: career.description,
    credits: career.credits,
    creditsCount: career.careerApplicant.creditsCount
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
