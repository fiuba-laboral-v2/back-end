import { Applicant } from "./index";
import { CareerApplicantRepository, CareerApplicantSerializer } from "../CareerApplicant";

import pick from "lodash/pick";

const applicantCareerMapper = async (applicant: Applicant) => {
  const careersApplicants = await CareerApplicantRepository.findByApplicant(
    applicant.uuid
  );
  return careersApplicants.map(careerApplicant =>
    CareerApplicantSerializer.serialize(careerApplicant)
  );
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
