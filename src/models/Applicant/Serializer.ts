import { Applicant } from "./index";
import { CareerApplicantRepository } from "../CareerApplicant/Repository";

import pick from "lodash/pick";

const applicantCareerMapper = async (applicant: Applicant) => {
  const careersApplicants = await CareerApplicantRepository.findByApplicant(applicant.uuid);
  return careersApplicants.map(careerApplicant => ({
    code: careerApplicant.careerCode,
    description: careerApplicant.career.description,
    credits: careerApplicant.career.credits,
    creditsCount: careerApplicant.creditsCount
  }));
};

const ApplicantSerializer = {
  serialize: async (applicant: Applicant) => ({
    uuid: applicant.uuid,
    name: applicant.name,
    surname: applicant.surname,
    padron: applicant.padron,
    description: applicant.description,
    careers: await applicantCareerMapper(applicant),
    capabilities: applicant.capabilities.map(
      capability => pick(capability, ["uuid", "description"])
    )
  })
};

export { ApplicantSerializer };
