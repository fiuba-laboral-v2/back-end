import { CareerApplicant } from "./index";

const CareerApplicantSerializer = {
  serialize: async (careerApplicant: CareerApplicant) => {
    const { credits, description } = await careerApplicant.getCareer();
    return {
      code: careerApplicant.careerCode,
      description: description,
      credits: credits,
      creditsCount: careerApplicant.creditsCount
    };
  }
};

export { CareerApplicantSerializer };
