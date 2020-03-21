import { CareerApplicant } from "./index";

const CareerApplicantSerializer = {
  serialize: async (careerApplicant: CareerApplicant) => {
    const career = await careerApplicant.getCareer();
    return {
      code: careerApplicant.careerCode,
      description: career.description,
      credits: career.credits,
      creditsCount: careerApplicant.creditsCount
    };
  }
};

export { CareerApplicantSerializer };
