import { ApplicantCareer } from "$models";

export const ApplicantCareersSerializer = {
  serialize: async (applicantCareer: ApplicantCareer) => {
    const { credits, description } = await applicantCareer.getCareer();
    return {
      code: applicantCareer.careerCode,
      description: description,
      credits: credits,
      creditsCount: applicantCareer.creditsCount,
      isGraduate: applicantCareer.isGraduate
    };
  }
};
