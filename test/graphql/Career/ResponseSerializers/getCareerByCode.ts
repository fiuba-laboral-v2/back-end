import { Career } from "../../../../src/models/Career";

const getCareerByCode = (career: Career) => (
  {
    code: career.code,
    description: career.description,
    credits: career.credits
  }
);

export { getCareerByCode };
