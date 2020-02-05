import { ApplicantProfile } from "./index";

const ApplicantSerializer = {
  serialize: (applicant: ApplicantProfile) => {
    return {
      uuid: applicant.uuid,
      name: applicant.name,
      surname: applicant.surname,
      padron: applicant.padron,
      description: applicant.description,
      credits: applicant.credits,
      careers: applicant.careers,
      capabilities: applicant.capabilities
    };
  }
};

export { ApplicantSerializer };
