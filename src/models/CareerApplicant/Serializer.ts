import { CareerApplicant } from "./index";

const CareerApplicantSerializer = {
  serialize: (careerApplicant: CareerApplicant) => ({
    code: careerApplicant.careerCode,
    description: careerApplicant.career.description,
    credits: careerApplicant.career.credits,
    creditsCount: careerApplicant.creditsCount
  })
};

export { CareerApplicantSerializer };
